export type OpportunityStage =
  | "lead_in"
  | "discovery"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost";

/** Enriched row for pipeline board/list (customer labels, counts, assignee snapshot). */
export type OpportunityBoardCard = OpportunityRecord & {
  /** Company / account label from the linked customer. */
  accountCompanyName: string;
  /** Primary contact name on the customer profile. */
  leadContactName: string;
  opportunityNoteCount: number;
  opportunityActivityCount: number;
  /** Avatar subject: opportunity creator, else customer creator. */
  assigneeUid?: string;
  assigneeDisplayName?: string;
  assigneePhotoUrl?: string;
};

/** `opportunities/{id}` — deal linked to a unified CRM customer (`customers/{customerId}`). */
export interface OpportunityRecord {
  id: string;
  customerId: string;
  organizationId?: string;
  name: string;
  stage: OpportunityStage;
  /** Deal size in minor units (e.g. cents), optional. */
  amountMinor?: number;
  currency: string;
  /** Snapshot of `customers.customFields` at creation or last explicit sync; displayed on proposals. */
  customFieldsSnapshot: Record<string, string>;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  createdByUid?: string;
}

export type OpportunityNoteKind = "note" | "call" | "email";

export type OpportunityNoteBodyFormat = "plain" | "html";

/** Free-form note attached to a single opportunity; lives in `opportunity_notes/{noteId}`. */
export interface OpportunityNoteRecord {
  id: string;
  opportunityId: string;
  organizationId?: string;
  authorUid: string;
  title?: string;
  body: string;
  /** Omitted on legacy rows — treat as `"plain"`. */
  bodyFormat?: OpportunityNoteBodyFormat;
  kind: OpportunityNoteKind;
  /** Epoch millis — Firestore `createdAt` (Timestamp or number). */
  createdAt: number;
}

export type OpportunityActivityType =
  | "created"
  | "stage_changed"
  | "proposal_created"
  | "won"
  | "lost"
  | "other";

/** Server-written audit event; lives in `opportunity_activities/{id}`. */
export interface OpportunityActivityRecord {
  id: string;
  opportunityId: string;
  organizationId?: string;
  type: OpportunityActivityType;
  title: string;
  detail?: string;
  /** Set on `proposal_created` rows for timeline link cards. */
  proposalId?: string;
  actorUid?: string;
  /** Epoch millis — Firestore `createdAt`. */
  createdAt: number;
}
