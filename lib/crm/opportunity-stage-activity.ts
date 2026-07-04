import { staffDisplayNameForActivity } from "@/lib/crm/staff-display-name";
import type { PortalUser } from "@/types/user";

export type OpportunityStageChangeAttribution = "system" | "user";

export function opportunityStageChangeDetail(
  attribution: OpportunityStageChangeAttribution,
  user?: PortalUser,
): string {
  if (attribution === "system") return "Stage changed by system";
  return `Stage changed by ${staffDisplayNameForActivity(user!)}`;
}
