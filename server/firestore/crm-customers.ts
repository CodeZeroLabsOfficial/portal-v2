import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { noteBodyPlainText } from "@/lib/crm/customer-note-body";
import { enrichTaskRecordsForStaff } from "@/lib/tasks/enrich-task-records";
import { isStaff } from "@/lib/auth/server-session";
import { asNumber, asString, asStringStringMap } from "@/lib/firestore/coerce";
import { logError } from "@/lib/common/logging";
import { coerceTimestampToMillis, millisFromFirestore } from "@/lib/firestore/timestamp";
import { notifyStaffAction } from "@/lib/notification/notify";
import { COLLECTIONS } from "@/server/firestore/collections";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { resolveOrCreateFirebaseUserByEmail } from "@/server/auth/resolve-or-create-firebase-user";
import { getStripe } from "@/lib/stripe/server";
import { normalizeAddressFields } from "@/lib/common/format";
import { sanitizeProposalHtmlServer } from "@/lib/proposal/sanitize-server";
import type { CustomerListRow } from "@/lib/customer/list";
import { taskCustomerContactLabel } from "@/lib/customer/task-customer-label";
import type { CreateCustomerInput, UpdateCustomerFormInput } from "@/lib/schemas/customer";
import type { InvoiceRecord } from "@/types/invoice";
import type { ProposalRecord } from "@/types/proposal";
import type {
  CustomerActivityRecord,
  CustomerCrmType,
  CustomerNoteRecord,
  CustomerRecord,
  CustomerSubscriptionRollup,
} from "@/types/customer";
import { batchGetAccountRecordsForStaff } from "@/server/firestore/crm-accounts";
import { deleteOpportunitiesForCustomerDb } from "@/server/firestore/crm-opportunities";
import { syncStripeCustomerIdFromCrmCustomerDoc } from "@/server/firestore/sync-portal-user-stripe";
import { deleteMirroredStripeCustomer } from "@/server/stripe/delete-stripe-customer-for-crm";
import { ensureStripeCustomer } from "@/server/stripe/proposal-billing";
import { parseProposalRecord } from "@/server/firestore/parse-proposal";
import { parseSignedAgreementRecord } from "@/server/firestore/parse-signed-agreement";
import { parseTaskRecord } from "@/server/firestore/parse-task";
import type { SubscriptionRecord, SubscriptionStatus } from "@/types/subscription";
import type { TaskRecord } from "@/types/task";
import type { PortalUser } from "@/types/user";
import type { SignedAgreementRecord } from "@/types/signed-agreement";

type AdminDb = NonNullable<ReturnType<typeof getFirebaseAdminFirestore>>;

function formatLocation(data: Pick<CustomerRecord, "city" | "region" | "country">): string {
  const parts = [data.city, data.region, data.country].filter(Boolean) as string[];
  return parts.length ? parts.join(", ") : "";
}

function parseCustomerRecord(id: string, data: Record<string, unknown>): CustomerRecord | null {
  if (typeof data !== "object" || data === null) return null;
  const organizationId = asString(data.organizationId)?.trim();
  const accountId = asString(data.accountId)?.trim();
  const name = asString(data.name) ?? "";
  const email = asString(data.email) ?? "";
  const tagsRaw = data.tags;
  const tags = Array.isArray(tagsRaw)
    ? tagsRaw.filter((t): t is string => typeof t === "string" && t.length > 0).slice(0, 30)
    : [];
  const customFields = asStringStringMap(data.customFields);
  const status = data.status === "archived" ? "archived" : "active";
  const crmType: CustomerCrmType = data.crmType === "lead" ? "lead" : "contact";
  const contactAddress = normalizeAddressFields({
    addressLine1: asString(data.addressLine1),
    addressLine2: asString(data.addressLine2),
    city: asString(data.city),
    region: asString(data.region),
    postalCode: asString(data.postalCode),
    country: asString(data.country),
  });
  return {
    id,
    ...(organizationId ? { organizationId } : {}),
    ...(accountId ? { accountId } : {}),
    name,
    email,
    phone: asString(data.phone),
    addressLine1: contactAddress.addressLine1 || undefined,
    addressLine2: contactAddress.addressLine2 || undefined,
    city: contactAddress.city || undefined,
    region: contactAddress.region || undefined,
    postalCode: contactAddress.postalCode || undefined,
    country: contactAddress.country || undefined,
    tags,
    customFields,
    portalUserId: asString(data.portalUserId),
    stripeCustomerId: asString(data.stripeCustomerId),
    ...(typeof data.stripeSyncedAt === "number" && Number.isFinite(data.stripeSyncedAt)
      ? { stripeSyncedAt: data.stripeSyncedAt }
      : millisFromFirestore(data, "stripeSyncedAt") > 0
        ? { stripeSyncedAt: millisFromFirestore(data, "stripeSyncedAt") }
        : {}),
    avatarUrl: asString(data.avatarUrl),
    crmType,
    status,
    createdAt: coerceTimestampToMillis(data.createdAt),
    updatedAt: coerceTimestampToMillis(data.updatedAt),
    createdByUid: asString(data.createdByUid),
  };
}

/** When a customer has multiple subscriptions, show the most actionable status first. */
const SUBSCRIPTION_ROLLUP_PRIORITY: SubscriptionStatus[] = [
  "past_due",
  "unpaid",
  "incomplete",
  "active",
  "trialing",
  "scheduled",
  "paused",
  "canceled",
  "incomplete_expired",
];

function rollupForStripeCustomer(
  stripeCustomerId: string | undefined,
  subscriptions: SubscriptionRecord[],
): CustomerSubscriptionRollup {
  if (!stripeCustomerId) return "none";
  const rel = subscriptions.filter((s) => s.customerId === stripeCustomerId);
  if (rel.length === 0) return "none";

  const statuses = new Set(rel.map((s) => s.status));
  if (statuses.size === 1) return [...statuses][0]!;

  for (const status of SUBSCRIPTION_ROLLUP_PRIORITY) {
    if (statuses.has(status)) return status;
  }
  return "active";
}

function customerToListRow(
  customer: CustomerRecord,
  subscriptions: SubscriptionRecord[],
  companyName?: string,
): CustomerListRow {
  const location = formatLocation(customer);
  const company = companyName?.trim() || undefined;
  const accountId = customer.accountId?.trim() || undefined;
  return {
    id: customer.id,
    name: customer.name.trim() || customer.email.trim() || customer.id,
    email: customer.email.trim() || "—",
    phone: customer.phone?.trim() || "—",
    location: location.trim() || "—",
    avatarUrl: customer.avatarUrl,
    company,
    accountId,
    tags: customer.tags,
    status: customer.status,
    subscriptionRollup: rollupForStripeCustomer(customer.stripeCustomerId, subscriptions),
    crmType: customer.crmType,
    portalUserId: customer.portalUserId,
    stripeCustomerId: customer.stripeCustomerId,
  };
}

function parseSubscriptionFirestore(id: string, data: Record<string, unknown>): SubscriptionRecord {
  return {
    id,
    customerId: asString(data.customerId) ?? "",
    organizationId: asString(data.organizationId),
    status:
      data.status === "scheduled" ||
      data.status === "trialing" ||
      data.status === "past_due" ||
      data.status === "canceled" ||
      data.status === "incomplete" ||
      data.status === "incomplete_expired" ||
      data.status === "unpaid" ||
      data.status === "paused"
        ? data.status
        : "active",
    priceId: asString(data.priceId),
    productName: asString(data.productName),
    currency: asString(data.currency) ?? "aud",
    interval: data.interval === "year" ? "year" : data.interval === "month" ? "month" : undefined,
    subscriptionStart: asNumber(data.subscriptionStart),
    subscriptionEnd: asNumber(data.subscriptionEnd),
    currentPeriodEnd: asNumber(data.currentPeriodEnd),
    cancelAtPeriodEnd: typeof data.cancelAtPeriodEnd === "boolean" ? data.cancelAtPeriodEnd : undefined,
    paymentCollectionPaused:
      typeof data.paymentCollectionPaused === "boolean" ? data.paymentCollectionPaused : undefined,
    monthlyAmountMinor: asNumber(data.monthlyAmountMinor),
    ...(millisFromFirestore(data, "createdAt") > 0
      ? { createdAt: millisFromFirestore(data, "createdAt") }
      : {}),
    collectionMethod:
      data.collectionMethod === "charge_automatically" || data.collectionMethod === "send_invoice"
        ? data.collectionMethod
        : undefined,
    defaultPaymentMethodType: asString(data.defaultPaymentMethodType),
    mrrAmount: asNumber(data.mrrAmount),
    updatedAt: millisFromFirestore(data, "updatedAt") || Date.now(),
  };
}

/** Top-level Stripe subscription mirrors — same source as the admin subscriptions directory. */
export async function listAllSubscriptionsForStaff(db: AdminDb): Promise<SubscriptionRecord[]> {
  const snap = await db.collection(COLLECTIONS.subscriptions).limit(500).get();
  return snap.docs.map((doc) => parseSubscriptionFirestore(doc.id, doc.data() as Record<string, unknown>));
}

/** Resolved CRM profile for a mirrored Stripe Customer id (`cus_…`). */
export interface StripeCustomerLink {
  customerId: string;
  label: string;
  /** Company name when set, else contact name / email — for subscription directory column. */
  accountName: string;
}

export interface AdminSubscriptionsSnapshot {
  subscriptions: SubscriptionRecord[];
  stripeCustomerLinks: Record<string, StripeCustomerLink>;
}

/** Mirrored Stripe subscriptions with CRM links for the admin subscriptions view. */
export async function getAdminSubscriptionsSnapshot(
  user: PortalUser,
): Promise<AdminSubscriptionsSnapshot | null> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) {
    return null;
  }
  try {
    const customers = await listCustomerRecordsForStaffSorted(user);
    if (!customers) return null;

    const accountIds = customers
      .map((c) => c.accountId?.trim())
      .filter((id): id is string => Boolean(id));
    const accounts = await batchGetAccountRecordsForStaff(user, accountIds);

    const stripeCustomerLinks: Record<string, StripeCustomerLink> = {};
    for (const c of customers) {
      const sid = c.stripeCustomerId?.trim();
      if (!sid || stripeCustomerLinks[sid]) continue;
      const company = c.accountId ? accounts.get(c.accountId)?.company?.trim() : undefined;
      const label = [c.name?.trim(), company].filter(Boolean).join(" · ") || c.email?.trim() || c.id;
      const accountName = company || c.name?.trim() || c.email?.trim() || "—";
      stripeCustomerLinks[sid] = {
        customerId: c.id,
        label: label.slice(0, 160),
        accountName: accountName.slice(0, 160),
      };
    }

    const subscriptions = await listAllSubscriptionsForStaff(db);
    subscriptions.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

    return { subscriptions, stripeCustomerLinks };
  } catch (error) {
    logError("admin_subscriptions_snapshot_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

/** All CRM customer documents for staff dashboards and directory rollups. */
export async function listCrmCustomerRecordsForStaff(user: PortalUser): Promise<CustomerRecord[]> {
  const rows = await listCustomerRecordsForStaffSorted(user);
  return rows ?? [];
}

/** Exported for account list/detail joins (avoid circular static imports). */
export async function listCustomerRecordsForStaffSorted(
  user: PortalUser,
): Promise<CustomerRecord[] | null> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) {
    return null;
  }
  try {
    const customerSnap = await db.collection(COLLECTIONS.customers).limit(500).get();
    return customerSnap.docs
      .map((doc) => parseCustomerRecord(doc.id, doc.data() as Record<string, unknown>))
      .filter((c): c is CustomerRecord => c !== null)
      .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
  } catch (error) {
    logError("crm_list_customers_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

export async function getAdminCustomerListRows(user: PortalUser): Promise<CustomerListRow[]> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) {
    return [];
  }
  try {
    const [customers, subscriptions] = await Promise.all([
      listCustomerRecordsForStaffSorted(user),
      listAllSubscriptionsForStaff(db),
    ]);
    if (!customers) return [];
    const accountIds = customers
      .map((c) => c.accountId?.trim())
      .filter((id): id is string => Boolean(id));
    const accounts = await batchGetAccountRecordsForStaff(user, accountIds);
    return customers.map((c) => {
      const company = c.accountId ? accounts.get(c.accountId)?.company : undefined;
      return customerToListRow(c, subscriptions, company);
    });
  } catch (error) {
    logError("crm_list_customers_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return [];
  }
}

export async function getCustomerRecordForOrg(
  user: PortalUser,
  customerId: string,
): Promise<CustomerRecord | null> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) return null;
  const ref = db.collection(COLLECTIONS.customers).doc(customerId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const parsed = parseCustomerRecord(snap.id, snap.data() as Record<string, unknown>);
  return parsed;
}

/** Token-based subscription checkout — verifies org scope vs proposal. */
export async function getCustomerRecordForPublicProposalCheckout(
  customerId: string,
  proposalOrganizationId: string | undefined,
): Promise<CustomerRecord | null> {
  const db = getFirebaseAdminFirestore();
  if (!db) return null;
  const id = customerId.trim();
  if (!id) return null;
  const snap = await db.collection(COLLECTIONS.customers).doc(id).get();
  if (!snap.exists) return null;
  const row = parseCustomerRecord(snap.id, snap.data() as Record<string, unknown>);
  if (!row) return null;
  const pOrg = proposalOrganizationId?.trim();
  const cOrg = row.organizationId?.trim();
  if (pOrg && cOrg && pOrg !== cOrg) return null;
  return row;
}

/** Batch-load CRM customers by id (Firestore `getAll`, chunks of 10). */
export async function batchGetCustomerRecordsForStaff(
  user: PortalUser,
  customerIds: string[],
): Promise<Map<string, CustomerRecord>> {
  const db = getFirebaseAdminFirestore();
  const out = new Map<string, CustomerRecord>();
  if (!db || !isStaff(user) || customerIds.length === 0) return out;
  const unique = [...new Set(customerIds.map((id) => id.trim()).filter(Boolean))];
  const chunkSize = 10;
  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const refs = chunk.map((id) => db.collection(COLLECTIONS.customers).doc(id));
    const snaps = await db.getAll(...refs);
    for (const snap of snaps) {
      if (!snap.exists) continue;
      const row = parseCustomerRecord(snap.id, snap.data() as Record<string, unknown>);
      if (row) out.set(row.id, row);
    }
  }
  return out;
}

function parseNote(id: string, data: Record<string, unknown>): CustomerNoteRecord | null {
  const customerId = asString(data.customerId);
  if (!customerId) return null;
  const organizationId = asString(data.organizationId);
  const kind = data.kind === "call" || data.kind === "email" ? data.kind : "note";
  const title = asString(data.title);
  const bodyFormat = data.bodyFormat === "html" ? "html" : data.bodyFormat === "plain" ? "plain" : undefined;
  return {
    id,
    customerId,
    ...(organizationId ? { organizationId } : {}),
    authorUid: asString(data.authorUid) ?? "",
    ...(title ? { title } : {}),
    body: asString(data.body) ?? "",
    ...(bodyFormat ? { bodyFormat } : {}),
    kind,
    createdAt: coerceTimestampToMillis(data.createdAt),
  };
}

function parseActivity(id: string, data: Record<string, unknown>): CustomerActivityRecord | null {
  const customerId = asString(data.customerId);
  if (!customerId) return null;
  const organizationId = asString(data.organizationId);
  const typeRaw = asString(data.type) ?? "other";
  const type =
    typeRaw === "created" ||
    typeRaw === "updated" ||
    typeRaw === "note" ||
    typeRaw === "stripe_sync" ||
    typeRaw === "auth_linked" ||
    typeRaw === "archived" ||
    typeRaw === "lead_converted" ||
    typeRaw === "opportunity_created" ||
    typeRaw === "proposal_created"
      ? typeRaw
      : "other";
  return {
    id,
    customerId,
    ...(organizationId ? { organizationId } : {}),
    type,
    title: asString(data.title) ?? "Activity",
    detail: asString(data.detail),
    proposalId: asString(data.proposalId),
    actorUid: asString(data.actorUid),
    createdAt: coerceTimestampToMillis(data.createdAt),
  };
}

export async function listCustomerNotes(
  user: PortalUser,
  customerId: string,
  limit = 80,
): Promise<CustomerNoteRecord[]> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) return [];
  const customer = await getCustomerRecordForOrg(user, customerId);
  if (!customer) return [];
  try {
    const snap = await db
      .collection(COLLECTIONS.customerNotes)
      .where("customerId", "==", customerId)
      .limit(limit)
      .get();
    const rows = snap.docs
      .map((d) => parseNote(d.id, d.data() as Record<string, unknown>))
      .filter((n): n is CustomerNoteRecord => n !== null);
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function listCustomerActivities(
  user: PortalUser,
  customerId: string,
  limit = 80,
): Promise<CustomerActivityRecord[]> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) return [];
  const customer = await getCustomerRecordForOrg(user, customerId);
  if (!customer) return [];
  try {
    const snap = await db
      .collection(COLLECTIONS.customerActivities)
      .where("customerId", "==", customerId)
      .limit(limit)
      .get();
    const rows = snap.docs
      .map((d) => parseActivity(d.id, d.data() as Record<string, unknown>))
      .filter((a): a is CustomerActivityRecord => a !== null);
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

function parseInvoice(id: string, data: Record<string, unknown>): InvoiceRecord {
  return {
    id,
    stripeInvoiceId: asString(data.stripeInvoiceId) ?? id,
    customerId: asString(data.customerId) ?? "",
    subscriptionId: asString(data.subscriptionId),
    organizationId: asString(data.organizationId),
    status:
      data.status === "draft" ||
      data.status === "paid" ||
      data.status === "void" ||
      data.status === "uncollectible"
        ? data.status
        : "open",
    currency: asString(data.currency) ?? "aud",
    amountDue: asNumber(data.amountDue) ?? 0,
    hostedInvoiceUrl: asString(data.hostedInvoiceUrl),
    invoicePdf: asString(data.invoicePdf),
    invoiceNumber: asString(data.invoiceNumber),
    issuedAt: millisFromFirestore(data, "issuedAt"),
    paidAt: asNumber(data.paidAt),
  };
}

export async function listInvoicesForStripeCustomer(
  user: PortalUser,
  stripeCustomerId: string | undefined,
): Promise<InvoiceRecord[]> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user) || !stripeCustomerId) return [];
  try {
    const snap = await db
      .collection(COLLECTIONS.invoices)
      .where("customerId", "==", stripeCustomerId)
      .limit(50)
      .get();
    const rows = snap.docs.map((d) => parseInvoice(d.id, d.data() as Record<string, unknown>));
    return rows.sort((a, b) => (b.issuedAt ?? 0) - (a.issuedAt ?? 0));
  } catch {
    return [];
  }
}

export async function listSubscriptionsForStripeCustomer(
  user: PortalUser,
  stripeCustomerId: string | undefined,
): Promise<SubscriptionRecord[]> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user) || !stripeCustomerId) return [];
  try {
    const snap = await db
      .collection(COLLECTIONS.subscriptions)
      .where("customerId", "==", stripeCustomerId)
      .limit(50)
      .get();
    const rows = snap.docs.map((d) => parseSubscriptionFirestore(d.id, d.data() as Record<string, unknown>));
    return rows.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  } catch {
    return [];
  }
}

/**
 * Proposals for this CRM profile: `customerId` on the row, or legacy / email-only matches on `recipientEmail`.
 * (Avoids loading a global `limit(100)` slice of the collection, which could omit newly created rows.)
 */
export async function listProposalsLinkedToCustomer(
  user: PortalUser,
  customerId: string,
  recipientEmail: string,
): Promise<ProposalRecord[]> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) return [];
  const emailLower = recipientEmail.trim().toLowerCase();

  try {
    const byCustomerSnap = await db
      .collection(COLLECTIONS.proposals)
      .where("customerId", "==", customerId)
      .limit(100)
      .get();

    const byEmailSnap =
      emailLower.length > 0
        ? await db
            .collection(COLLECTIONS.proposals)
            .where("recipientEmail", "==", emailLower)
            .limit(100)
            .get()
        : null;

    const seen = new Set<string>();
    const rows: ProposalRecord[] = [];
    const docs = [...byCustomerSnap.docs, ...(byEmailSnap?.docs ?? [])];
    for (const doc of docs) {
      if (seen.has(doc.id)) continue;
      seen.add(doc.id);
      rows.push(parseProposalRecord(doc.id, doc.data() as Record<string, unknown>));
    }
    return rows.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  } catch (err) {
    logError("listProposalsLinkedToCustomer", { err: err instanceof Error ? err.message : String(err) });
    return [];
  }
}

/**
 * Signed Services Agreements for this CRM customer (`customerId` on the snapshot row).
 */
export async function listSignedAgreementsForCustomer(
  user: PortalUser,
  customerId: string,
): Promise<SignedAgreementRecord[]> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) return [];
  try {
    const snap = await db
      .collection(COLLECTIONS.signedAgreements)
      .where("customerId", "==", customerId)
      .limit(80)
      .get();
    const rows: SignedAgreementRecord[] = [];
    for (const d of snap.docs) {
      const parsed = parseSignedAgreementRecord(d.id, d.data() as Record<string, unknown>);
      if (parsed) rows.push(parsed);
    }
    return rows.sort((a, b) => b.signedAt - a.signedAt);
  } catch (err) {
    logError("list_signed_agreements_for_customer_failed", {
      customerId,
      message: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

/**
 * Loads one signed agreement for the customer detail document viewer.
 * Enforces `customerId` match and staff `organizationId` when present on the user.
 */
export async function getSignedAgreementForCustomerContext(
  user: PortalUser,
  customerId: string,
  signedAgreementId: string,
  customerOrganizationId?: string,
): Promise<SignedAgreementRecord | null> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) return null;
  const id = signedAgreementId.trim();
  if (!id) return null;
  try {
    const snap = await db.collection(COLLECTIONS.signedAgreements).doc(id).get();
    if (!snap.exists) return null;
    const row = parseSignedAgreementRecord(snap.id, snap.data() as Record<string, unknown>);
    if (!row) return null;
    if (row.customerId !== customerId) return null;
    if (user.organizationId && row.organizationId !== user.organizationId) return null;
    const custOrg = customerOrganizationId?.trim();
    if (custOrg && row.organizationId !== custOrg) return null;
    return row;
  } catch (err) {
    logError("get_signed_agreement_for_customer_failed", {
      customerId,
      signedAgreementId: id,
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export interface CustomerPickerOption {
  id: string;
  label: string;
}

/** Active CRM leads and contacts as `{ id, label }` for task customer pickers. */
export async function listCustomerPickerOptionsForOrg(
  user: PortalUser,
): Promise<CustomerPickerOption[]> {
  const rows = await getAdminCustomerListRows(user);
  return rows
    .filter((c) => c.status === "active")
    .map((c) => ({
      id: c.id,
      label: taskCustomerContactLabel(c),
    }));
}

export async function listTasksForCustomer(user: PortalUser, customerId: string): Promise<TaskRecord[]> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) return [];
  try {
    const snap = await db
      .collection(COLLECTIONS.tasks)
      .where("customerId", "==", customerId)
      .limit(80)
      .get();
    const rows = snap.docs
      .map((d) => parseTaskRecord(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    return enrichTaskRecordsForStaff(user, rows);
  } catch {
    return [];
  }
}

export interface CreateCustomerResult {
  ok: true;
  customerId: string;
}

export interface CreateCustomerError {
  ok: false;
  message: string;
}

function contactAddressPayloadFromInput(input: {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}): {
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
} {
  const n = normalizeAddressFields({
    addressLine1: input.addressLine1,
    addressLine2: input.addressLine2,
    city: input.city,
    region: input.region,
    postalCode: input.postalCode,
    country: input.country,
  });
  return {
    addressLine1: n.addressLine1?.trim() || null,
    addressLine2: n.addressLine2?.trim() || null,
    city: n.city?.trim() || null,
    region: n.region?.trim() || null,
    postalCode: n.postalCode?.trim() || null,
    country: n.country?.trim() || null,
  };
}

export async function createCustomerDocument(
  user: PortalUser,
  input: CreateCustomerInput,
): Promise<CreateCustomerResult | CreateCustomerError> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) {
    return { ok: false, message: "CRM is only available to admin or team members." };
  }
  const customFields: Record<string, string> = {};

  const crmType: CustomerCrmType = input.saveAsLead ? "lead" : "contact";
  const accountId = input.accountId?.trim() || undefined;
  let accountCompanyName = "";
  if (accountId) {
    const { getAccountRecordForStaff } = await import("@/server/firestore/crm-accounts");
    const account = await getAccountRecordForStaff(user, accountId);
    if (!account) {
      return { ok: false, message: "Account not found." };
    }
    accountCompanyName = account.company.trim();
  }

  const col = db.collection(COLLECTIONS.customers);
  const docRef = col.doc();
  const payload = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    accountId: accountId || null,
    phone: input.phone?.trim() || null,
    ...contactAddressPayloadFromInput(input),
    tags: input.tags ?? [],
    customFields,
    portalUserId: null,
    stripeCustomerId: null,
    avatarUrl: null,
    status: "active",
    crmType,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdByUid: user.uid,
  };

  await docRef.set(payload);

  let leadOpportunityCreated = false;
  if (crmType === "lead") {
    try {
      const now = Timestamp.now();
      const opportunityName =
        accountCompanyName || payload.name.trim() || payload.email.trim() || "New lead";
      const opportunityPayload: Record<string, unknown> = {
        customerId: docRef.id,
        name: opportunityName,
        stage: "lead_in",
        customFieldsSnapshot: customFields,
        currency: "aud",
        createdAt: now,
        updatedAt: now,
        createdByUid: user.uid,
      };
      if (user.organizationId) {
        opportunityPayload.organizationId = user.organizationId;
      }
      const oppRef = await db.collection(COLLECTIONS.opportunities).add(opportunityPayload);
      leadOpportunityCreated = true;
      try {
        const { appendOpportunitySystemActivityDb } = await import(
          "@/server/firestore/opportunity-system-activity"
        );
        await appendOpportunitySystemActivityDb(db, oppRef.id, {
          type: "created",
          title: "Deal created",
          actorUid: user.uid,
          organizationId: user.organizationId,
        });
      } catch (activityErr) {
        logError("create_customer_lead_opportunity_activity_failed", {
          opportunityId: oppRef.id,
          message: activityErr instanceof Error ? activityErr.message : String(activityErr),
        });
      }
    } catch (err) {
      logError("create_customer_lead_opportunity_failed", {
        customerId: docRef.id,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const stripe = getStripe();
  if (stripe) {
    try {
      const crmForStripe: CustomerRecord = {
        id: docRef.id,
        name: payload.name,
        email: payload.email,
        ...(accountId ? { accountId } : {}),
        tags: payload.tags,
        customFields,
        crmType,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const { stripeCustomerId, created } = await ensureStripeCustomer(stripe, crmForStripe);
      if (created) {
        await docRef.update({
          stripeCustomerId,
          stripeSyncedAt: Date.now(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } catch (err) {
      logError("create_customer_stripe_sync_failed", {
        customerId: docRef.id,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const firstActivityAt = Timestamp.now();
  await db.collection(COLLECTIONS.customerActivities).add({
    customerId: docRef.id,
    type: "created",
    title: crmType === "lead" ? "Lead created" : "Customer created",
    detail: input.name.trim(),
    actorUid: user.uid,
    createdAt: firstActivityAt,
  });

  if (leadOpportunityCreated) {
    await db.collection(COLLECTIONS.customerActivities).add({
      customerId: docRef.id,
      type: "opportunity_created",
      title: "Opportunity created",
      detail: payload.name || payload.email,
      actorUid: user.uid,
      createdAt: Timestamp.fromMillis(firstActivityAt.toMillis() + 2),
    });
  }

  await syncStripeCustomerIdFromCrmCustomerDoc(db, docRef.id);

  const createdLabel = input.name.trim() || payload.email || docRef.id;
  await notifyStaffAction({
    actor: user,
    title: crmType === "lead" ? "Lead created" : "Contact created",
    message: createdLabel,
    category: "crm",
    entity: { type: "customer", id: docRef.id, label: createdLabel },
    href: `/admin/customers/${docRef.id}`,
    idempotencyKey: `customer:created:${docRef.id}`,
  });

  return {
    ok: true,
    customerId: docRef.id,
  };
}

export async function updateCustomerDocument(
  user: PortalUser,
  input: UpdateCustomerFormInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) {
    return { ok: false, message: "CRM is only available to admin or team members." };
  }

  const { id: customerId, ...rest } = input;
  const existing = await getCustomerRecordForOrg(user, customerId);
  if (!existing) {
    return { ok: false, message: "Customer not found." };
  }

  const accountId = rest.accountId?.trim() || undefined;
  if (accountId) {
    const { getAccountRecordForStaff } = await import("@/server/firestore/crm-accounts");
    const account = await getAccountRecordForStaff(user, accountId);
    if (!account) {
      return { ok: false, message: "Account not found." };
    }
  }

  const payload: Record<string, unknown> = {
    name: rest.name.trim(),
    email: rest.email.trim().toLowerCase(),
    accountId: accountId || null,
    phone: rest.phone?.trim() || null,
    ...contactAddressPayloadFromInput(rest),
    tags: rest.tags ?? [],
    customFields: existing.customFields ?? {},
    updatedAt: FieldValue.serverTimestamp(),
  };

  await db.collection(COLLECTIONS.customers).doc(customerId).update(payload);

  const updatedAt = Timestamp.now();
  await db.collection(COLLECTIONS.customerActivities).add({
    customerId,
    type: "updated",
    title: "Profile updated",
    actorUid: user.uid,
    createdAt: updatedAt,
  });

  await syncStripeCustomerIdFromCrmCustomerDoc(db, customerId);

  const updatedLabel = rest.name.trim() || existing.name || customerId;
  await notifyStaffAction({
    actor: user,
    organizationId: user.organizationId ?? existing.organizationId,
    title: existing.crmType === "lead" ? "Lead updated" : "Contact updated",
    message: updatedLabel,
    category: "crm",
    entity: { type: "customer", id: customerId, label: updatedLabel },
    href: `/admin/customers/${customerId}`,
  });

  return { ok: true };
}

/**
 * One-click portal: resolve Firebase user by CRM email (create if missing) and set `portalUserId`.
 * No-op when access is already linked.
 */
export async function enableCustomerPortalAccess(
  user: PortalUser,
  customerId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) {
    return { ok: false, message: "CRM is only available to admin or team members." };
  }

  const id = customerId.trim();
  if (!id) {
    return { ok: false, message: "Customer id is required." };
  }

  const existing = await getCustomerRecordForOrg(user, id);
  if (!existing) {
    return { ok: false, message: "Customer not found." };
  }
  if (existing.portalUserId?.trim()) {
    return { ok: true };
  }

  const email = existing.email?.trim().toLowerCase();
  if (!email) {
    return { ok: false, message: "Customer email is required to enable access." };
  }

  const resolved = await resolveOrCreateFirebaseUserByEmail(email, {
    active: true,
    createIfMissing: true,
  });
  if (!resolved.ok) {
    return { ok: false, message: resolved.message };
  }
  if (!resolved.uid) {
    return { ok: false, message: "Could not link or create an account for this email." };
  }

  await db.collection(COLLECTIONS.customers).doc(id).update({
    portalUserId: resolved.uid,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updatedAt = Timestamp.now();
  await db.collection(COLLECTIONS.customerActivities).add({
    customerId: id,
    type: "auth_linked",
    title: resolved.createdNew ? "Created User Access" : "Linked User Access",
    detail: email,
    actorUid: user.uid,
    createdAt: updatedAt,
  });

  await syncStripeCustomerIdFromCrmCustomerDoc(db, id);

  return { ok: true };
}

export interface AppendCustomerNoteInput {
  title?: string;
  body: string;
  bodyFormat: CustomerNoteRecord["bodyFormat"];
  kind: CustomerNoteRecord["kind"];
}

export async function appendCustomerNote(
  user: PortalUser,
  customerId: string,
  input: AppendCustomerNoteInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) {
    return { ok: false, message: "Not allowed." };
  }
  const customer = await getCustomerRecordForOrg(user, customerId);
  if (!customer) return { ok: false, message: "Customer not found." };

  const bodyFormat = input.bodyFormat === "html" ? "html" : "plain";
  const body =
    bodyFormat === "html"
      ? sanitizeProposalHtmlServer(input.body.trim())
      : input.body.trim();
  const plainExcerpt = noteBodyPlainText(body, bodyFormat);

  const noteAt = Timestamp.now();
  const notePayload: Record<string, unknown> = {
    customerId,
    authorUid: user.uid,
    body,
    kind: input.kind,
    createdAt: noteAt,
  };
  if (input.title) {
    notePayload.title = input.title;
  }
  if (bodyFormat === "html") {
    notePayload.bodyFormat = "html";
  }

  await db.collection(COLLECTIONS.customerNotes).add(notePayload);
  await db.collection(COLLECTIONS.customerActivities).add({
    customerId,
    type: "note",
    title:
      input.kind === "call" ? "Call logged" : input.kind === "email" ? "Email logged" : "Note added",
    detail: plainExcerpt.slice(0, 280),
    actorUid: user.uid,
    createdAt: Timestamp.fromMillis(noteAt.toMillis() + 1),
  });

  const noteKindLabel =
    input.kind === "call" ? "Call logged" : input.kind === "email" ? "Email logged" : "Note added";
  await notifyStaffAction({
    actor: user,
    organizationId: user.organizationId ?? customer.organizationId,
    title: noteKindLabel,
    message: customer.name || "Contact",
    category: "crm",
    entity: { type: "customer", id: customerId, label: customer.name },
    href: `/admin/customers/${customerId}`,
  });

  return { ok: true };
}

export async function setCustomerArchived(
  user: PortalUser,
  customerId: string,
  archived: boolean,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) return { ok: false, message: "Not allowed." };
  const customer = await getCustomerRecordForOrg(user, customerId);
  if (!customer) return { ok: false, message: "Customer not found." };
  await db.collection(COLLECTIONS.customers).doc(customerId).update({
    status: archived ? "archived" : "active",
    updatedAt: FieldValue.serverTimestamp(),
  });
  await db.collection(COLLECTIONS.customerActivities).add({
    customerId,
    type: "archived",
    title: archived ? "Archived" : "Restored",
    actorUid: user.uid,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { ok: true };
}

async function deleteQueryDocsWhere(
  db: AdminDb,
  collection: string,
  field: string,
  value: string,
): Promise<void> {
  const snap = await db.collection(collection).where(field, "==", value).limit(400).get();
  if (snap.empty) return;
  const batch = db.batch();
  for (const doc of snap.docs) {
    batch.delete(doc.ref);
  }
  await batch.commit();
  if (snap.size >= 400) await deleteQueryDocsWhere(db, collection, field, value);
}

/** Deletes proposals linked by `customerId` or legacy `recipientEmail` match. */
export async function deleteProposalsForCustomerDb(
  db: AdminDb,
  customerId: string,
  recipientEmail: string,
): Promise<void> {
  await deleteQueryDocsWhere(db, COLLECTIONS.proposals, "customerId", customerId);
  const emailLower = recipientEmail.trim().toLowerCase();
  if (emailLower) {
    await deleteQueryDocsWhere(db, COLLECTIONS.proposals, "recipientEmail", emailLower);
  }
}

export async function deleteCustomerDocument(
  user: PortalUser,
  customerId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) return { ok: false, message: "Not allowed." };
  const customer = await getCustomerRecordForOrg(user, customerId);
  if (!customer) return { ok: false, message: "Customer not found." };

  if (customer.stripeCustomerId) {
    const stripe = getStripe();
    if (stripe) {
      const stripeDel = await deleteMirroredStripeCustomer(stripe, customer.stripeCustomerId);
      if (!stripeDel.ok) return { ok: false, message: stripeDel.message };
    }
  }

  const database = db;

  await deleteQueryDocsWhere(database, COLLECTIONS.customerNotes, "customerId", customerId);
  await deleteQueryDocsWhere(database, COLLECTIONS.customerActivities, "customerId", customerId);
  await deleteQueryDocsWhere(database, COLLECTIONS.signedAgreements, "customerId", customerId);
  await deleteQueryDocsWhere(database, COLLECTIONS.tasks, "customerId", customerId);
  await deleteProposalsForCustomerDb(database, customerId, customer.email);
  await deleteOpportunitiesForCustomerDb(database, customerId);

  const stripeCustomerId = customer.stripeCustomerId?.trim();
  if (stripeCustomerId) {
    await deleteQueryDocsWhere(database, COLLECTIONS.subscriptions, "customerId", stripeCustomerId);
    await deleteQueryDocsWhere(database, COLLECTIONS.invoices, "customerId", stripeCustomerId);
    await deleteQueryDocsWhere(database, COLLECTIONS.payments, "customerId", stripeCustomerId);
    await database.collection(COLLECTIONS.stripeCustomers).doc(stripeCustomerId).delete().catch(() => {});
  }

  await database.collection(COLLECTIONS.customers).doc(customerId).delete();
  return { ok: true };
}

/** Persists Stripe customer id from server flows that cannot use {@link syncStripeCustomerBasics} (no staff user). */
export async function persistStripeCustomerIdOnCustomer(
  customerId: string,
  stripeCustomerId: string,
): Promise<void> {
  const db = getFirebaseAdminFirestore();
  if (!db) return;
  const id = customerId.trim();
  const sid = stripeCustomerId.trim();
  if (!id || !sid) return;
  await db
    .collection(COLLECTIONS.customers)
    .doc(id)
    .set(
      { stripeCustomerId: sid, stripeSyncedAt: Date.now(), updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
  await syncStripeCustomerIdFromCrmCustomerDoc(db, id);
}

export async function syncStripeCustomerBasics(
  user: PortalUser,
  customerId: string,
  stripeCustomerId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) return { ok: false, message: "Not allowed." };
  const customer = await getCustomerRecordForOrg(user, customerId);
  if (!customer) return { ok: false, message: "Customer not found." };
  await db
    .collection(COLLECTIONS.customers)
    .doc(customerId)
    .update({
      stripeCustomerId,
      stripeSyncedAt: Date.now(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  await db.collection(COLLECTIONS.customerActivities).add({
    customerId,
    type: "stripe_sync",
    title: "Stripe customer linked",
    detail: stripeCustomerId,
    actorUid: user.uid,
    createdAt: FieldValue.serverTimestamp(),
  });
  await syncStripeCustomerIdFromCrmCustomerDoc(db, customerId);
  return { ok: true };
}
