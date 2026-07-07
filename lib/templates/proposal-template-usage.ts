import type { DocumentReference, Firestore, Transaction } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { asNumber } from "@/lib/firestore/coerce";
import { COLLECTIONS } from "@/server/firestore/collections";

/** Atomically creates a proposal and increments linked proposal template usage when applicable. */
export async function commitNewProposalWithTemplateUsage(
  db: Firestore,
  proposalRef: DocumentReference,
  payload: Record<string, unknown>,
  sourceTemplateId?: string,
): Promise<void> {
  const proposalTemplateId = sourceTemplateId?.trim() || undefined;
  if (!proposalTemplateId) {
    await proposalRef.set(payload);
    return;
  }

  const batch = db.batch();
  batch.set(proposalRef, payload);
  batch.update(db.collection(COLLECTIONS.proposalTemplates).doc(proposalTemplateId), {
    usageCount: FieldValue.increment(1),
  });
  await batch.commit();
}

function clampDecrementUsage(current: number): number {
  return Math.max(0, current - 1);
}

interface TemplateUsageDecrement {
  ref: DocumentReference;
  current: number;
}

async function readProposalTemplateUsageForDecrement(
  tx: Transaction,
  db: Firestore,
  templateId: string,
): Promise<TemplateUsageDecrement | null> {
  const ref = db.collection(COLLECTIONS.proposalTemplates).doc(templateId);
  const snap = await tx.get(ref);
  if (!snap.exists) return null;
  const data = snap.data() as Record<string, unknown>;
  const current = asNumber(data.usageCount) ?? 0;
  return { ref, current };
}

/** Deletes a proposal and decrements linked proposal template usage (never below zero). */
export async function deleteProposalWithTemplateUsageDecrement(
  db: Firestore,
  proposalId: string,
  sourceTemplateId?: string,
): Promise<void> {
  const proposalRef = db.collection(COLLECTIONS.proposals).doc(proposalId);
  const proposalTemplateId = sourceTemplateId?.trim() || undefined;

  if (!proposalTemplateId) {
    await proposalRef.delete();
    return;
  }

  await db.runTransaction(async (tx) => {
    const proposalSnap = await tx.get(proposalRef);
    if (!proposalSnap.exists) return;

    const decrement = await readProposalTemplateUsageForDecrement(tx, db, proposalTemplateId);

    tx.delete(proposalRef);

    if (decrement) {
      tx.update(decrement.ref, { usageCount: clampDecrementUsage(decrement.current) });
    }
  });
}
