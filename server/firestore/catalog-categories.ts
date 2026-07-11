import { FieldValue, type QueryDocumentSnapshot } from "firebase-admin/firestore";
import { isStaff } from "@/lib/auth/server-session";
import {
  isCatalogCategoryId,
  SEED_CATALOG_CATEGORIES,
  slugifyCatalogCategoryLabel,
} from "@/lib/catalog/categories";
import { asString } from "@/lib/firestore/coerce";
import { millisFromFirestore } from "@/lib/firestore/timestamp";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { COLLECTIONS } from "@/server/firestore/collections";
import type { CatalogCategoryOption, CatalogCategoryRecord } from "@/types/catalog-category";
import type { PortalUser } from "@/types/user";

function orgIdForUser(user: PortalUser): string {
  return user.organizationId?.trim() || "default";
}

/** `id` on the record is the stable slug referenced by services / proposals / templates. */
export function parseCatalogCategoryRecord(
  docId: string,
  data: Record<string, unknown>,
): CatalogCategoryRecord {
  const slug = asString(data.slug)?.trim() || docId;
  return {
    id: slug,
    organizationId: asString(data.organizationId) ?? "",
    label: asString(data.label)?.trim() || slug,
    createdAt: millisFromFirestore(data, "createdAt"),
    updatedAt: millisFromFirestore(data, "updatedAt"),
  };
}

async function findCategoryDocBySlug(
  organizationId: string,
  slug: string,
): Promise<QueryDocumentSnapshot | null> {
  const db = getFirebaseAdminFirestore();
  if (!db) return null;
  const snap = await db
    .collection(COLLECTIONS.catalogCategories)
    .where("organizationId", "==", organizationId)
    .get();
  return snap.docs.find((doc) => {
    const data = doc.data() as Record<string, unknown>;
    return (asString(data.slug)?.trim() || doc.id) === slug;
  }) ?? null;
}

async function ensureSeedCategories(organizationId: string): Promise<void> {
  const db = getFirebaseAdminFirestore();
  if (!db) return;

  const col = db.collection(COLLECTIONS.catalogCategories);
  const existing = await col.where("organizationId", "==", organizationId).limit(1).get();
  if (!existing.empty) return;

  const batch = db.batch();
  for (const seed of SEED_CATALOG_CATEGORIES) {
    const ref = col.doc();
    batch.set(ref, {
      organizationId,
      slug: seed.id,
      label: seed.label,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
}

/**
 * Lists org categories (seeds defaults on first access). Sorted by label.
 */
export async function listCatalogCategoriesForOrg(
  user: PortalUser,
): Promise<CatalogCategoryRecord[]> {
  if (!isStaff(user)) return [];
  const db = getFirebaseAdminFirestore();
  if (!db) return [];

  const organizationId = orgIdForUser(user);
  await ensureSeedCategories(organizationId);

  const snap = await db
    .collection(COLLECTIONS.catalogCategories)
    .where("organizationId", "==", organizationId)
    .get();

  const rows = snap.docs.map((doc) =>
    parseCatalogCategoryRecord(doc.id, doc.data() as Record<string, unknown>),
  );
  rows.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  return rows;
}

export async function listCatalogCategoryOptionsForOrg(
  user: PortalUser,
): Promise<CatalogCategoryOption[]> {
  const rows = await listCatalogCategoriesForOrg(user);
  return rows.map((r) => ({ id: r.id, label: r.label }));
}

export async function createCatalogCategoryForOrg(
  user: PortalUser,
  labelRaw: string,
): Promise<{ ok: true; category: CatalogCategoryOption } | { ok: false; message: string }> {
  if (!isStaff(user)) return { ok: false, message: "Unauthorized." };
  const db = getFirebaseAdminFirestore();
  if (!db) return { ok: false, message: "Database unavailable." };

  const label = labelRaw.trim();
  if (!label) return { ok: false, message: "Category name is required." };
  if (label.length > 80) return { ok: false, message: "Category name is too long." };

  const slug = slugifyCatalogCategoryLabel(label);
  if (!isCatalogCategoryId(slug)) {
    return { ok: false, message: "Could not build a valid category id from that name." };
  }

  const organizationId = orgIdForUser(user);
  await ensureSeedCategories(organizationId);

  const existing = await findCategoryDocBySlug(organizationId, slug);
  if (existing) {
    const record = parseCatalogCategoryRecord(
      existing.id,
      existing.data() as Record<string, unknown>,
    );
    return { ok: true, category: { id: record.id, label: record.label } };
  }

  await db.collection(COLLECTIONS.catalogCategories).add({
    organizationId,
    slug,
    label,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { ok: true, category: { id: slug, label } };
}
