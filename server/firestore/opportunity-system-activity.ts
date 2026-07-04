import { FieldValue, Timestamp, type Firestore } from "firebase-admin/firestore";

import { asString } from "@/lib/firestore/coerce";
import { COLLECTIONS } from "@/server/firestore/collections";
import type { OpportunityActivityType } from "@/types/opportunity";

export interface AppendOpportunitySystemActivityInput {
  type: OpportunityActivityType;
  title: string;
  detail?: string;
  actorUid?: string;
  organizationId?: string;
}

/** Writes a read-only system activity row and bumps the parent opportunity `updatedAt`. */
export async function appendOpportunitySystemActivityDb(
  db: Firestore,
  opportunityId: string,
  input: AppendOpportunitySystemActivityInput,
): Promise<void> {
  const trimmedTitle = input.title.trim();
  if (!trimmedTitle) return;

  const now = Timestamp.now();
  const payload: Record<string, unknown> = {
    opportunityId,
    type: input.type,
    title: trimmedTitle,
    createdAt: now,
  };

  const detail = input.detail?.trim();
  if (detail) payload.detail = detail;

  const actorUid = input.actorUid?.trim();
  if (actorUid) payload.actorUid = actorUid;

  const organizationId = input.organizationId?.trim();
  if (organizationId) payload.organizationId = organizationId;

  await db.collection(COLLECTIONS.opportunityActivities).add(payload);
  await db
    .collection(COLLECTIONS.opportunities)
    .doc(opportunityId)
    .update({ updatedAt: FieldValue.serverTimestamp() });
}

const VALID_ACTIVITY_TYPES = new Set<OpportunityActivityType>([
  "created",
  "stage_changed",
  "proposal_created",
  "won",
  "lost",
  "other",
]);

export function parseOpportunityActivityType(value: unknown): OpportunityActivityType {
  const raw = asString(value);
  if (raw && VALID_ACTIVITY_TYPES.has(raw as OpportunityActivityType)) {
    return raw as OpportunityActivityType;
  }
  return "other";
}
