import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { COLLECTIONS } from "@/server/firestore/collections";
import type { ProposalCustomerSignerPrefill, ProposalRecord } from "@/types/proposal";

/** Loads CRM name, email, and company for the proposal’s linked customer (public agreement prefill). */
export async function loadProposalCustomerSignerPrefill(
  proposal: ProposalRecord,
): Promise<ProposalCustomerSignerPrefill | null> {
  const id = proposal.customerId?.trim();
  if (!id) return null;
  const db = getFirebaseAdminFirestore();
  if (!db) return null;
  try {
    const snap = await db.collection(COLLECTIONS.customers).doc(id).get();
    if (!snap.exists) return null;
    const d = snap.data() as Record<string, unknown>;
    const name = typeof d.name === "string" ? d.name.trim() : "";
    const emailFromDoc = typeof d.email === "string" ? d.email.trim() : "";
    const email = emailFromDoc || (proposal.recipientEmail?.trim() ?? "");
    let organization = "";
    const accountId = typeof d.accountId === "string" ? d.accountId.trim() : "";
    if (accountId) {
      const asnap = await db.collection(COLLECTIONS.accounts).doc(accountId).get();
      if (asnap.exists) {
        const a = asnap.data() as Record<string, unknown>;
        organization = typeof a.company === "string" ? a.company.trim() : "";
      }
    }
    return { name, email, organization };
  } catch {
    return null;
  }
}
