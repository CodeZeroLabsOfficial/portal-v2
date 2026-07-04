import type { OpportunityStage } from "@/types/opportunity";

/**
 * Active chevron tint per stage — 15% hue wash + saturated label text (matches Won pattern).
 * Hues align with {@link opportunityStageBadgeDisplay} / Todo List badge palette.
 */
export const OPPORTUNITY_STAGE_ACTIVE_CHEVRON: Record<OpportunityStage, string> = {
  lead_in: "bg-gray-500/15 text-gray-700 dark:text-gray-300",
  discovery: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  proposal_sent: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  negotiation: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  won: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  lost: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export function opportunityStageChevronActiveClasses(stage: OpportunityStage): string {
  return OPPORTUNITY_STAGE_ACTIVE_CHEVRON[stage];
}
