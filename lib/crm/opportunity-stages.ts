import type { OpportunityStage } from "@/types/opportunity";

/** Ordered pipeline stages — Kanban columns and detail-view stepper follow this order. */
export const OPPORTUNITY_STAGES: readonly OpportunityStage[] = [
  "lead",
  "discovery",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

export function isOpportunityStage(value: string): value is OpportunityStage {
  return (OPPORTUNITY_STAGES as readonly string[]).includes(value);
}

const stageLabels: Record<OpportunityStage, string> = {
  lead: "Lead in",
  discovery: "Discovery",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export function opportunityStageLabel(stage: OpportunityStage): string {
  return stageLabels[stage];
}
