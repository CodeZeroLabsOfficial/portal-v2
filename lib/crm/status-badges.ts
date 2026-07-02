import type { VariantProps } from "class-variance-authority";

import { opportunityStageLabel } from "@/lib/crm/opportunity-stages";
import { getSubscriptionStatusBadgeDisplay } from "@/lib/subscription/status-badge";
import { coerceTaskPriority, taskPriorityLabel } from "@/lib/tasks/task-priority";
import { taskBoardColumnLabel, statusToBoardColumn } from "@/lib/tasks/task-board-columns";
import type { badgeVariants } from "@/components/ui/badge";
import type { CustomerCrmType, CustomerSubscriptionRollup } from "@/types/customer";
import type { OpportunityStage } from "@/types/opportunity";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export interface StatusBadgeDisplay {
  label: string;
  variant: BadgeVariant;
}

export function customerStatusBadgeDisplay(status: "active" | "archived"): StatusBadgeDisplay {
  if (status === "archived") {
    return { label: "Archived", variant: "secondary" };
  }
  return { label: "Active", variant: "success" };
}

export function customerCrmTypeBadgeDisplay(crmType: CustomerCrmType): StatusBadgeDisplay {
  if (crmType === "lead") {
    return { label: "Lead", variant: "amber" };
  }
  return { label: "Contact", variant: "sky" };
}

export function subscriptionRollupBadgeDisplay(
  rollup: CustomerSubscriptionRollup,
): StatusBadgeDisplay {
  return getSubscriptionStatusBadgeDisplay(rollup);
}

export function opportunityStageBadgeDisplay(stage: OpportunityStage): StatusBadgeDisplay {
  const label = opportunityStageLabel(stage);
  switch (stage) {
    case "won":
      return { label, variant: "success" };
    case "lost":
      return { label, variant: "destructive" };
    case "negotiation":
      return { label, variant: "warning" };
    case "proposal_sent":
      return { label, variant: "info" };
    case "discovery":
      return { label, variant: "warning" };
    default:
      return { label, variant: "secondary" };
  }
}

export function taskPriorityBadgeDisplay(priority: string | undefined): StatusBadgeDisplay {
  const value = coerceTaskPriority(priority);
  const label = taskPriorityLabel(value);
  switch (value) {
    case "high":
      return { label, variant: "destructive" };
    case "medium":
      return { label, variant: "warning" };
    default:
      return { label, variant: "neutral" };
  }
}

export function taskColumnBadgeDisplay(status: string | undefined): StatusBadgeDisplay {
  const column = statusToBoardColumn(status);
  const label = taskBoardColumnLabel(column);
  switch (column) {
    case "done":
      return { label, variant: "success" };
    case "in_progress":
      return { label, variant: "purple" };
    case "review":
      return { label, variant: "warning" };
    default:
      return { label, variant: "info" };
  }
}
