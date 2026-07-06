import type { DocumentReference, Firestore, Transaction, WriteBatch } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { asNumber } from "@/lib/firestore/coerce";
import { collectContractTemplateIds } from "@/lib/templates/collect-contract-template-ids";
import { COLLECTIONS } from "@/server/firestore/collections";
import type { ProposalDocument } from "@/types/proposal";

/** Template ids referenced by a proposal row at create/delete time. */
export interface ProposalTemplateUsageSnapshot {
  proposalTemplateId?: string;
  contractTemplateIds: string[];
}

export function proposalTemplateUsageSnapshot(
  sourceTemplateId: string | undefined,
  document: ProposalDocument,
): ProposalTemplateUsageSnapshot {
  const proposalTemplateId = sourceTemplateId?.trim() || undefined;
  return {
    proposalTemplateId,
    contractTemplateIds: collectContractTemplateIds(document),
  };
}

export function incrementContractTemplateUsageIds(
  batch: WriteBatch,
  db: Firestore,
  contractTemplateIds: readonly string[],
): void {
  const unique = [...new Set(contractTemplateIds.map((id) => id.trim()).filter(Boolean))];
  for (const id of unique) {
    batch.update(db.collection(COLLECTIONS.contractTemplates).doc(id), {
      usageCount: FieldValue.increment(1),
    });
  }
}

function applyUsageIncrementsToBatch(
  batch: WriteBatch,
  db: Firestore,
  snapshot: ProposalTemplateUsageSnapshot,
): void {
  if (snapshot.proposalTemplateId) {
    batch.update(db.collection(COLLECTIONS.proposalTemplates).doc(snapshot.proposalTemplateId), {
      usageCount: FieldValue.increment(1),
    });
  }
  incrementContractTemplateUsageIds(batch, db, snapshot.contractTemplateIds);
}

/** Atomically creates a proposal and increments linked template usage counters. */
export async function commitNewProposalWithTemplateUsage(
  db: Firestore,
  proposalRef: DocumentReference,
  payload: Record<string, unknown>,
  snapshot: ProposalTemplateUsageSnapshot,
): Promise<void> {
  const batch = db.batch();
  batch.set(proposalRef, payload);
  applyUsageIncrementsToBatch(batch, db, snapshot);
  await batch.commit();
}

function clampDecrementUsage(current: number): number {
  return Math.max(0, current - 1);
}

async function decrementTemplateUsageInTransaction(
  tx: Transaction,
  db: Firestore,
  collection: typeof COLLECTIONS.proposalTemplates | typeof COLLECTIONS.contractTemplates,
  templateId: string,
): Promise<void> {
  const ref = db.collection(collection).doc(templateId);
  const snap = await tx.get(ref);
  if (!snap.exists) return;
  const data = snap.data() as Record<string, unknown>;
  const current = asNumber(data.usageCount) ?? 0;
  tx.update(ref, { usageCount: clampDecrementUsage(current) });
}

/** Deletes a proposal and decrements linked template usage (never below zero). */
export async function deleteProposalWithTemplateUsageDecrement(
  db: Firestore,
  proposalId: string,
  snapshot: ProposalTemplateUsageSnapshot,
): Promise<void> {
  const proposalRef = db.collection(COLLECTIONS.proposals).doc(proposalId);
  const contractIds = [
    ...new Set(snapshot.contractTemplateIds.map((id) => id.trim()).filter(Boolean)),
  ];

  await db.runTransaction(async (tx) => {
    const proposalSnap = await tx.get(proposalRef);
    if (!proposalSnap.exists) return;

    tx.delete(proposalRef);

    if (snapshot.proposalTemplateId) {
      await decrementTemplateUsageInTransaction(
        tx,
        db,
        COLLECTIONS.proposalTemplates,
        snapshot.proposalTemplateId,
      );
    }

    for (const contractTemplateId of contractIds) {
      await decrementTemplateUsageInTransaction(
        tx,
        db,
        COLLECTIONS.contractTemplates,
        contractTemplateId,
      );
    }
  });
}
