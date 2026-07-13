/**
 * One-shot migration: virtual company accounts → `accounts/{id}` + `customers.accountId`.
 *
 * Groups existing customers by normalized `company` string, creates real account docs,
 * links contacts, deletes `accountOnly` stubs, and strips legacy company fields.
 *
 * Usage (from repo root, with Firebase Admin credentials configured):
 *   npx tsx scripts/migrate-accounts.ts
 *   npx tsx scripts/migrate-accounts.ts --dry-run
 */

import { FieldValue } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "../lib/firebase/admin-app";
import { COLLECTIONS } from "../server/firestore/collections";

const DRY_RUN = process.argv.includes("--dry-run");

const LEGACY_COMPANY_FIELDS = [
  "company",
  "companyPhone",
  "companyEmail",
  "companyWebsite",
  "companyAbn",
  "companyAcn",
  "companyAddressLine1",
  "companyAddressLine2",
  "companyCity",
  "companyRegion",
  "companyPostalCode",
  "companyCountry",
  "accountOnly",
] as const;

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function pickLatestNonEmpty(
  docs: { id: string; data: Record<string, unknown>; updatedAt: number }[],
  field: string,
): string | null {
  for (const doc of docs) {
    const v = asString(doc.data[field])?.trim();
    if (v) return v;
  }
  return null;
}

function updatedAtMs(data: Record<string, unknown>): number {
  const u = data.updatedAt;
  if (typeof u === "number" && Number.isFinite(u)) return u;
  if (u && typeof u === "object" && "toMillis" in u && typeof (u as { toMillis: () => number }).toMillis === "function") {
    return (u as { toMillis: () => number }).toMillis();
  }
  return 0;
}

async function main() {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    console.error("Firebase Admin Firestore is not configured.");
    process.exit(1);
  }

  console.log(DRY_RUN ? "DRY RUN — no writes will be committed." : "LIVE RUN — writing to Firestore.");

  const snap = await db.collection(COLLECTIONS.customers).get();
  console.log(`Loaded ${snap.size} customer document(s).`);

  type Row = { id: string; data: Record<string, unknown>; updatedAt: number };
  const stubs: Row[] = [];
  const withCompany: Row[] = [];
  const withoutCompany: Row[] = [];

  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>;
    const row: Row = { id: doc.id, data, updatedAt: updatedAtMs(data) };
    if (data.accountOnly === true) {
      stubs.push(row);
      continue;
    }
    const company = asString(data.company)?.trim();
    if (company) {
      withCompany.push(row);
    } else {
      withoutCompany.push(row);
    }
  }

  const byNorm = new Map<string, Row[]>();
  for (const row of withCompany) {
    const norm = asString(row.data.company)!.trim().toLowerCase();
    const bucket = byNorm.get(norm) ?? [];
    bucket.push(row);
    byNorm.set(norm, bucket);
  }

  // Include stubs in groups (or create solo accounts from stubs).
  for (const stub of stubs) {
    const company = asString(stub.data.company)?.trim();
    if (!company) {
      console.warn(`Skipping accountOnly stub ${stub.id} with empty company.`);
      continue;
    }
    const norm = company.toLowerCase();
    const bucket = byNorm.get(norm) ?? [];
    bucket.push(stub);
    byNorm.set(norm, bucket);
  }

  let accountsCreated = 0;
  let customersLinked = 0;
  let stubsDeleted = 0;
  let fieldsStripped = 0;

  for (const [, group] of byNorm) {
    const sorted = [...group].sort((a, b) => b.updatedAt - a.updatedAt);
    const company = pickLatestNonEmpty(sorted, "company");
    if (!company) continue;

    const accountPayload = {
      company,
      companyPhone: pickLatestNonEmpty(sorted, "companyPhone"),
      companyEmail: pickLatestNonEmpty(sorted, "companyEmail")?.toLowerCase() ?? null,
      companyWebsite: pickLatestNonEmpty(sorted, "companyWebsite"),
      companyAbn: pickLatestNonEmpty(sorted, "companyAbn"),
      companyAcn: pickLatestNonEmpty(sorted, "companyAcn"),
      companyAddressLine1: pickLatestNonEmpty(sorted, "companyAddressLine1"),
      companyAddressLine2: pickLatestNonEmpty(sorted, "companyAddressLine2"),
      companyCity: pickLatestNonEmpty(sorted, "companyCity"),
      companyRegion: pickLatestNonEmpty(sorted, "companyRegion"),
      companyPostalCode: pickLatestNonEmpty(sorted, "companyPostalCode"),
      companyCountry: pickLatestNonEmpty(sorted, "companyCountry"),
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const contacts = sorted.filter((r) => r.data.accountOnly !== true);
    const stubIds = sorted.filter((r) => r.data.accountOnly === true).map((r) => r.id);

    if (DRY_RUN) {
      console.log(
        `[dry-run] account "${company}" ← ${contacts.length} contact(s), ${stubIds.length} stub(s)`,
      );
      accountsCreated += 1;
      customersLinked += contacts.length;
      stubsDeleted += stubIds.length;
      fieldsStripped += contacts.length;
      continue;
    }

    const accountRef = db.collection(COLLECTIONS.accounts).doc();
    await accountRef.set(accountPayload);
    accountsCreated += 1;

    for (const contact of contacts) {
      const clear: Record<string, unknown> = {
        accountId: accountRef.id,
        updatedAt: FieldValue.serverTimestamp(),
      };
      for (const field of LEGACY_COMPANY_FIELDS) {
        clear[field] = FieldValue.delete();
      }
      await db.collection(COLLECTIONS.customers).doc(contact.id).update(clear);
      customersLinked += 1;
      fieldsStripped += 1;
    }

    for (const stubId of stubIds) {
      await db.collection(COLLECTIONS.customers).doc(stubId).delete();
      stubsDeleted += 1;
    }
  }

  // Strip leftover company fields on customers with no company (safety).
  for (const row of withoutCompany) {
    const hasLegacy = LEGACY_COMPANY_FIELDS.some((f) => f in row.data && row.data[f] != null);
    if (!hasLegacy) continue;
    if (DRY_RUN) {
      fieldsStripped += 1;
      continue;
    }
    const clear: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    for (const field of LEGACY_COMPANY_FIELDS) {
      clear[field] = FieldValue.delete();
    }
    await db.collection(COLLECTIONS.customers).doc(row.id).update(clear);
    fieldsStripped += 1;
  }

  console.log(
    JSON.stringify(
      {
        dryRun: DRY_RUN,
        accountsCreated,
        customersLinked,
        stubsDeleted,
        fieldsStripped,
        customersWithoutCompany: withoutCompany.length,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
