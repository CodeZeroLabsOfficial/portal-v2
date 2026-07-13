import { FieldValue } from "firebase-admin/firestore";

import { isStaff } from "@/lib/auth/server-session";
import { asString } from "@/lib/firestore/coerce";
import { logError } from "@/lib/common/logging";
import { coerceTimestampToMillis } from "@/lib/firestore/timestamp";
import { formatAddressLines } from "@/lib/common/format";
import { COLLECTIONS } from "@/server/firestore/collections";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import type { AccountListRow } from "@/lib/account/list";
import type { CreateAccountFormInput, UpdateAccountFormInput } from "@/lib/schemas/account";
import type { AccountDetailAggregate, AccountRecord } from "@/types/account";
import type { CustomerRecord } from "@/types/customer";
import type { PortalUser } from "@/types/user";

export function parseAccountRecord(id: string, data: Record<string, unknown>): AccountRecord | null {
  if (typeof data !== "object" || data === null) return null;
  const company = asString(data.company)?.trim();
  if (!company) return null;
  const organizationId = asString(data.organizationId)?.trim();
  const status = data.status === "archived" ? "archived" : "active";
  return {
    id,
    ...(organizationId ? { organizationId } : {}),
    company,
    companyPhone: asString(data.companyPhone),
    companyEmail: asString(data.companyEmail),
    companyWebsite: asString(data.companyWebsite),
    companyAbn: asString(data.companyAbn),
    companyAcn: asString(data.companyAcn),
    companyAddressLine1: asString(data.companyAddressLine1),
    companyAddressLine2: asString(data.companyAddressLine2),
    companyCity: asString(data.companyCity),
    companyRegion: asString(data.companyRegion),
    companyPostalCode: asString(data.companyPostalCode),
    companyCountry: asString(data.companyCountry),
    status,
    createdAt: coerceTimestampToMillis(data.createdAt),
    updatedAt: coerceTimestampToMillis(data.updatedAt),
    createdByUid: asString(data.createdByUid),
  };
}

function companyAddressSummary(a: AccountRecord): string {
  const lines = formatAddressLines({
    addressLine1: a.companyAddressLine1,
    addressLine2: a.companyAddressLine2,
    city: a.companyCity,
    region: a.companyRegion,
    postalCode: a.companyPostalCode,
    country: a.companyCountry,
  });
  return lines.join(" · ") || "—";
}

function pickPrimaryContact(contacts: CustomerRecord[]): {
  contactName: string;
  contactId?: string;
  additionalContactCount: number;
} {
  const sorted = [...contacts].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  const active = sorted.filter((r) => r.status === "active");
  const pool = active.length > 0 ? active : sorted;
  const primary = pool[0];
  if (!primary) {
    return { contactName: "", additionalContactCount: 0 };
  }
  return {
    contactName: primary.name.trim(),
    contactId: primary.id,
    additionalContactCount: Math.max(0, pool.length - 1),
  };
}

function accountCompanyPayload(input: CreateAccountFormInput | UpdateAccountFormInput): Record<string, unknown> {
  return {
    company: input.company.trim(),
    companyPhone: input.companyPhone?.trim() || null,
    companyEmail: input.companyEmail?.trim()?.toLowerCase() || null,
    companyWebsite: input.companyWebsite?.trim() || null,
    companyAbn: input.companyAbn?.trim() || null,
    companyAcn: input.companyAcn?.trim() || null,
    companyAddressLine1: input.companyAddressLine1?.trim() || null,
    companyAddressLine2: input.companyAddressLine2?.trim() || null,
    companyCity: input.companyCity?.trim() || null,
    companyRegion: input.companyRegion?.trim() || null,
    companyPostalCode: input.companyPostalCode?.trim() || null,
    companyCountry: input.companyCountry?.trim() || null,
  };
}

export async function listAccountRecordsForStaff(user: PortalUser): Promise<AccountRecord[] | null> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) return null;
  try {
    const snap = await db.collection(COLLECTIONS.accounts).limit(500).get();
    return snap.docs
      .map((doc) => parseAccountRecord(doc.id, doc.data() as Record<string, unknown>))
      .filter((a): a is AccountRecord => a !== null)
      .sort((a, b) => a.company.localeCompare(b.company, undefined, { sensitivity: "base" }));
  } catch (error) {
    logError("crm_list_accounts_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

export async function getAccountRecordForStaff(
  user: PortalUser,
  accountId: string,
): Promise<AccountRecord | null> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) return null;
  const id = accountId.trim();
  if (!id) return null;
  const snap = await db.collection(COLLECTIONS.accounts).doc(id).get();
  if (!snap.exists) return null;
  return parseAccountRecord(snap.id, snap.data() as Record<string, unknown>);
}

/** Batch-load accounts by id (Firestore `getAll`, chunks of 10). */
export async function batchGetAccountRecordsForStaff(
  user: PortalUser,
  accountIds: string[],
): Promise<Map<string, AccountRecord>> {
  const db = getFirebaseAdminFirestore();
  const out = new Map<string, AccountRecord>();
  if (!db || !isStaff(user) || accountIds.length === 0) return out;
  const unique = [...new Set(accountIds.map((id) => id.trim()).filter(Boolean))];
  const chunkSize = 10;
  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const refs = chunk.map((id) => db.collection(COLLECTIONS.accounts).doc(id));
    const snaps = await db.getAll(...refs);
    for (const snap of snaps) {
      if (!snap.exists) continue;
      const row = parseAccountRecord(snap.id, snap.data() as Record<string, unknown>);
      if (row) out.set(row.id, row);
    }
  }
  return out;
}

export async function getAdminAccountListRows(user: PortalUser): Promise<AccountListRow[]> {
  const accounts = await listAccountRecordsForStaff(user);
  if (!accounts) return [];

  // Lazy import avoids a circular dependency with crm-customers.
  const { listCustomerRecordsForStaffSorted } = await import("@/server/firestore/crm-customers");
  const customers = await listCustomerRecordsForStaffSorted(user);
  if (!customers) return [];

  const contactsByAccount = new Map<string, CustomerRecord[]>();
  for (const c of customers) {
    const aid = c.accountId?.trim();
    if (!aid) continue;
    const bucket = contactsByAccount.get(aid) ?? [];
    bucket.push(c);
    contactsByAccount.set(aid, bucket);
  }

  return accounts.map((account) => {
    const contacts = contactsByAccount.get(account.id) ?? [];
    const { contactName, contactId, additionalContactCount } = pickPrimaryContact(contacts);
    return {
      id: account.id,
      displayName: account.company,
      addressSummary: companyAddressSummary(account),
      companyPhone: account.companyPhone?.trim() ?? "",
      companyEmail: account.companyEmail?.trim() ?? "",
      companyWebsite: account.companyWebsite?.trim() ?? "",
      contactName,
      ...(contactId ? { contactId } : {}),
      additionalContactCount,
    };
  });
}

export async function getAccountDetailForId(
  user: PortalUser,
  accountId: string,
): Promise<AccountDetailAggregate | null> {
  const account = await getAccountRecordForStaff(user, accountId);
  if (!account) return null;

  const { listCustomerRecordsForStaffSorted } = await import("@/server/firestore/crm-customers");
  const customers = await listCustomerRecordsForStaffSorted(user);
  if (!customers) return null;

  const contacts = customers
    .filter((c) => c.accountId?.trim() === account.id)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return { ...account, contacts };
}

export async function createAccountDocument(
  user: PortalUser,
  input: CreateAccountFormInput,
): Promise<{ ok: true; accountId: string } | { ok: false; message: string }> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) {
    return { ok: false, message: "CRM is only available to admin or team members." };
  }

  const companyTrimmed = input.company.trim();
  if (!companyTrimmed) {
    return { ok: false, message: "Company name is required." };
  }

  const docRef = db.collection(COLLECTIONS.accounts).doc();
  const payload = {
    ...accountCompanyPayload(input),
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdByUid: user.uid,
    ...(user.organizationId ? { organizationId: user.organizationId } : {}),
  };

  try {
    await docRef.set(payload);
    return { ok: true, accountId: docRef.id };
  } catch (error) {
    logError("crm_create_account_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return { ok: false, message: "Failed to create account." };
  }
}

export async function updateAccountDocument(
  user: PortalUser,
  input: UpdateAccountFormInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) {
    return { ok: false, message: "CRM is only available to admin or team members." };
  }

  const existing = await getAccountRecordForStaff(user, input.id);
  if (!existing) {
    return { ok: false, message: "Account not found." };
  }

  try {
    await db
      .collection(COLLECTIONS.accounts)
      .doc(input.id)
      .update({
        ...accountCompanyPayload(input),
        updatedAt: FieldValue.serverTimestamp(),
      });
    return { ok: true };
  } catch (error) {
    logError("crm_update_account_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return { ok: false, message: "Failed to update account details." };
  }
}

/**
 * Deletes the account and every linked customer (cascading proposals, opportunities,
 * notes, activities, tasks, and Stripe mirrors via deleteCustomerDocument).
 */
export async function deleteAccountDocument(
  user: PortalUser,
  accountId: string,
): Promise<{ ok: true; deletedCustomers: number } | { ok: false; message: string }> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) {
    return { ok: false, message: "Not allowed." };
  }

  const account = await getAccountRecordForStaff(user, accountId);
  if (!account) {
    return { ok: false, message: "Account not found." };
  }

  const { listCustomerRecordsForStaffSorted, deleteCustomerDocument } = await import(
    "@/server/firestore/crm-customers"
  );
  const customers = await listCustomerRecordsForStaffSorted(user);
  if (!customers) {
    return { ok: false, message: "Could not load customers." };
  }

  const linked = customers.filter((c) => c.accountId?.trim() === account.id);
  for (const customer of linked) {
    const result = await deleteCustomerDocument(user, customer.id);
    if (!result.ok) {
      return { ok: false, message: result.message };
    }
  }

  try {
    await db.collection(COLLECTIONS.accounts).doc(account.id).delete();
    return { ok: true, deletedCustomers: linked.length };
  } catch (error) {
    logError("crm_delete_account_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return { ok: false, message: "Failed to delete account." };
  }
}

/** Resolve company display name for a customer (account join). */
export function accountCompanyNameFromMaps(
  customer: CustomerRecord | undefined,
  accounts: Map<string, AccountRecord>,
): string {
  if (!customer) return "—";
  const aid = customer.accountId?.trim();
  if (aid) {
    const company = accounts.get(aid)?.company?.trim();
    if (company) return company;
  }
  return customer.name?.trim() || "—";
}
