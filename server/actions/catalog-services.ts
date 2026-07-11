"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { requireStaffSession } from "@/lib/auth/server-session";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { runAdminWrite } from "@/lib/firebase/admin-write";
import { logError } from "@/lib/common/logging";
import { getStripe } from "@/lib/stripe/server";
import {
  createCatalogServiceSchema,
  createInputToServiceTerms,
  resolveCreateCatalogSlug,
  resolveUpdateCatalogSlug,
  updateCatalogServiceFeaturesSchema,
  updateCatalogServiceSchema,
  updateInputToServiceTerms,
} from "@/lib/schemas/catalog-service";
import { zodErrorToMessage } from "@/lib/common/zod-error";
import { COLLECTIONS } from "@/server/firestore/collections";
import { getCatalogServiceForStaff } from "@/server/firestore/catalog-services";
import { syncCatalogServiceToStripe } from "@/server/stripe/catalog-service-stripe-sync";
import type { CatalogServiceKind } from "@/types/catalog-service";

function revalidateCatalogPaths(serviceId?: string) {
  revalidatePath("/admin/services", "layout");
  if (serviceId) revalidatePath(`/admin/services/${serviceId}`);
  revalidatePath("/admin/subscriptions", "layout");
  revalidatePath("/admin/proposals", "layout");
  revalidatePath("/admin/templates", "layout");
}

/** Plan-only catalogue fields — omitted (not stored) for add-ons. */
function planOnlyCatalogFirestoreFields(
  serviceType: CatalogServiceKind,
  plan: {
    includedUsers: number;
    includedLocations: number;
    includedAdmins: number;
    features: string[];
  },
): Record<string, number | string[]> {
  if (serviceType === "addon") return {};
  return {
    includedUsers: Math.max(0, Math.floor(plan.includedUsers)),
    includedLocations: Math.max(0, Math.floor(plan.includedLocations)),
    includedAdmins: Math.max(0, Math.floor(plan.includedAdmins)),
    features: plan.features,
  };
}

function deletePlanOnlyCatalogFirestoreFields(): Record<string, FieldValue> {
  return {
    includedUsers: FieldValue.delete(),
    includedLocations: FieldValue.delete(),
    includedAdmins: FieldValue.delete(),
    features: FieldValue.delete(),
  };
}

export async function createCatalogServiceAction(
  raw: unknown,
): Promise<{ ok: true; serviceId: string } | { ok: false; message: string }> {
  const user = await requireStaffSession();
  if (!user) return { ok: false, message: "Unauthorized." };

  const parsed = createCatalogServiceSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: zodErrorToMessage(parsed.error) };
  }

  const db = getFirebaseAdminFirestore();
  if (!db) return { ok: false, message: "Database unavailable." };

  const ref = db.collection(COLLECTIONS.services).doc();
  const name = parsed.data.name.trim();
  const slug = resolveCreateCatalogSlug(parsed.data);
  const pricingModel = parsed.data.billingType === "one_off" ? "flat" : parsed.data.pricingModel;
  const terms = createInputToServiceTerms(parsed.data);
  const description = parsed.data.description?.trim() ?? "";

  const write = await runAdminWrite(
    "catalog_service_create_failed",
    { serviceId: ref.id, uid: user.uid },
    "Could not create the service.",
    () =>
      ref.set({
        organizationId: user.organizationId ?? "default",
        createdByUid: user.uid,
        name,
        slug,
        category: parsed.data.category,
        serviceType: parsed.data.serviceType,
        description,
        billingType: parsed.data.billingType,
        pricingModel,
        status: "draft",
        currency: parsed.data.currency.toLowerCase(),
        ...planOnlyCatalogFirestoreFields(parsed.data.serviceType, {
          includedUsers: parsed.data.includedUsers ?? 0,
          includedLocations: parsed.data.includedLocations ?? 0,
          includedAdmins: parsed.data.includedAdmins ?? 0,
          features: [],
        }),
        ...(parsed.data.serviceType === "plan" &&
        typeof parsed.data.upfrontCost12Minor === "number" &&
        parsed.data.upfrontCost12Minor > 0
          ? { upfrontCost12Minor: Math.round(parsed.data.upfrontCost12Minor) }
          : {}),
        ...(parsed.data.serviceType === "plan" &&
        typeof parsed.data.upfrontCost24Minor === "number" &&
        parsed.data.upfrontCost24Minor > 0
          ? { upfrontCost24Minor: Math.round(parsed.data.upfrontCost24Minor) }
          : {}),
        terms,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }),
  );
  if (!write.ok) return write;

  const syncResult = await pushCatalogServiceToStripe(user, ref.id, { setActive: true });
  if (!syncResult.ok) return syncResult;

  revalidateCatalogPaths(ref.id);
  return { ok: true, serviceId: ref.id };
}

export async function updateCatalogServiceAction(
  raw: unknown,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await requireStaffSession();
  if (!user) return { ok: false, message: "Unauthorized." };

  const parsed = updateCatalogServiceSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: zodErrorToMessage(parsed.error) };
  }

  const id = parsed.data.serviceId.trim();
  const existing = await getCatalogServiceForStaff(user, id);
  if (!existing) return { ok: false, message: "Service not found." };
  if (existing.status === "archived") {
    return { ok: false, message: "Archived services cannot be edited." };
  }

  const db = getFirebaseAdminFirestore();
  if (!db) return { ok: false, message: "Database unavailable." };

  const name = parsed.data.name.trim();
  const slug = resolveUpdateCatalogSlug(parsed.data);
  const serviceType = existing.serviceType ?? "plan";
  const pricingModel = parsed.data.billingType === "one_off" ? "flat" : parsed.data.pricingModel;
  const terms = updateInputToServiceTerms(existing, parsed.data);
  const description = parsed.data.description?.trim() ?? "";

  const payload: Record<string, unknown> = {
    name,
    slug,
    category: parsed.data.category,
    description,
    billingType: parsed.data.billingType,
    pricingModel,
    terms,
    updatedAt: FieldValue.serverTimestamp(),
    ...planOnlyCatalogFirestoreFields(serviceType, {
      includedUsers: parsed.data.includedUsers ?? 0,
      includedLocations: parsed.data.includedLocations ?? 0,
      includedAdmins: parsed.data.includedAdmins ?? 0,
      features: existing.features,
    }),
  };

  if (serviceType === "plan") {
    if (
      typeof parsed.data.upfrontCost12Minor === "number" &&
      parsed.data.upfrontCost12Minor > 0
    ) {
      payload.upfrontCost12Minor = Math.round(parsed.data.upfrontCost12Minor);
    } else {
      payload.upfrontCost12Minor = FieldValue.delete();
    }
    if (
      typeof parsed.data.upfrontCost24Minor === "number" &&
      parsed.data.upfrontCost24Minor > 0
    ) {
      payload.upfrontCost24Minor = Math.round(parsed.data.upfrontCost24Minor);
    } else {
      payload.upfrontCost24Minor = FieldValue.delete();
    }
  }

  const write = await runAdminWrite(
    "catalog_service_update_failed",
    { serviceId: id, uid: user.uid },
    "Could not save the service.",
    () => db.collection(COLLECTIONS.services).doc(id).set(payload, { merge: true }),
  );
  if (!write.ok) return write;

  revalidateCatalogPaths(id);
  return { ok: true };
}

export async function updateCatalogServiceFeaturesAction(
  raw: unknown,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await requireStaffSession();
  if (!user) return { ok: false, message: "Unauthorized." };

  const parsed = updateCatalogServiceFeaturesSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: zodErrorToMessage(parsed.error) };
  }

  const id = parsed.data.serviceId.trim();
  const existing = await getCatalogServiceForStaff(user, id);
  if (!existing) return { ok: false, message: "Service not found." };
  if (existing.serviceType === "addon") {
    return { ok: false, message: "Only plans support feature lists." };
  }
  if (existing.status === "archived") {
    return { ok: false, message: "Archived services cannot be edited." };
  }

  const db = getFirebaseAdminFirestore();
  if (!db) return { ok: false, message: "Database unavailable." };

  const write = await runAdminWrite(
    "catalog_service_features_update_failed",
    { serviceId: id, uid: user.uid },
    "Could not save features.",
    () =>
      db.collection(COLLECTIONS.services).doc(id).set(
        {
          features: parsed.data.features,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      ),
  );
  if (!write.ok) return write;

  revalidateCatalogPaths(id);
  return { ok: true };
}

async function pushCatalogServiceToStripe(
  user: NonNullable<Awaited<ReturnType<typeof requireStaffSession>>>,
  serviceId: string,
  opts: { setActive: boolean },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const id = serviceId.trim();
  const existing = await getCatalogServiceForStaff(user, id);
  if (!existing) return { ok: false, message: "Service not found." };

  if (existing.terms.length === 0) {
    return { ok: false, message: "Add 12- and 24-month pricing before syncing to Stripe." };
  }

  const stripe = getStripe();
  if (!stripe) return { ok: false, message: "Stripe is not configured on the server." };

  const sync = await syncCatalogServiceToStripe(stripe, existing);
  if (!sync.ok) return sync;

  const db = getFirebaseAdminFirestore();
  if (!db) return { ok: false, message: "Database unavailable." };

  const payload: Record<string, unknown> = {
    stripeProductId: sync.stripeProductId,
    terms: sync.terms,
    stripeSyncedAt: sync.stripeSyncedAt,
    sortOrder: FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (opts.setActive) {
    payload.status = "active";
  }

  const write = await runAdminWrite(
    opts.setActive ? "catalog_service_activate_failed" : "catalog_service_sync_failed",
    { serviceId: id, uid: user.uid },
    opts.setActive ? "Could not activate the service." : "Could not sync to Stripe.",
    () => db.collection(COLLECTIONS.services).doc(id).set(payload, { merge: true }),
  );
  if (!write.ok) return write;

  revalidateCatalogPaths(id);
  return { ok: true };
}

export async function activateCatalogServiceAction(
  serviceId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await requireStaffSession();
  if (!user) return { ok: false, message: "Unauthorized." };

  const id = serviceId.trim();
  if (!id) return { ok: false, message: "Service id is required." };

  return pushCatalogServiceToStripe(user, id, { setActive: true });
}

export async function syncCatalogServiceStripeAction(
  serviceId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await requireStaffSession();
  if (!user) return { ok: false, message: "Unauthorized." };

  const id = serviceId.trim();
  if (!id) return { ok: false, message: "Service id is required." };

  return pushCatalogServiceToStripe(user, id, { setActive: false });
}

export async function archiveCatalogServiceAction(
  serviceId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await requireStaffSession();
  if (!user) return { ok: false, message: "Unauthorized." };

  const id = serviceId.trim();
  const existing = await getCatalogServiceForStaff(user, id);
  if (!existing) return { ok: false, message: "Service not found." };

  const db = getFirebaseAdminFirestore();
  if (!db) return { ok: false, message: "Database unavailable." };

  const write = await runAdminWrite(
    "catalog_service_archive_failed",
    { serviceId: id, uid: user.uid },
    "Could not archive the service.",
    () =>
      db.collection(COLLECTIONS.services).doc(id).set(
        {
          status: "archived",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      ),
  );
  if (!write.ok) return write;

  revalidateCatalogPaths(id);
  return { ok: true };
}

export async function deleteCatalogServiceAction(
  serviceId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await requireStaffSession();
  if (!user) return { ok: false, message: "Unauthorized." };

  const id = serviceId.trim();
  if (!id) return { ok: false, message: "Service id is required." };

  const existing = await getCatalogServiceForStaff(user, id);
  if (!existing) return { ok: false, message: "Service not found." };

  const stripeProductId = existing.stripeProductId?.trim();
  const stripe = getStripe();
  if (stripe && stripeProductId) {
    try {
      await stripe.products.update(stripeProductId, { active: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logError("catalog_service_stripe_product_deactivate_failed", { serviceId: id, message });
    }
  }

  const db = getFirebaseAdminFirestore();
  if (!db) return { ok: false, message: "Database unavailable." };

  const write = await runAdminWrite(
    "catalog_service_delete_failed",
    { serviceId: id, uid: user.uid },
    "Could not delete the service.",
    () => db.collection(COLLECTIONS.services).doc(id).delete(),
  );
  if (!write.ok) return write;

  revalidateCatalogPaths(id);
  return { ok: true };
}
