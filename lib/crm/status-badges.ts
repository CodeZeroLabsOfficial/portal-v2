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
  className?: string;
}

export function customerStatusBadgeDisplay(status: "active" | "archived"): StatusBadgeDisplay {
  if (status === "archived") {
    return { label: "Archived", variant: "secondary" };
  }
  return { label: "Active", variant: "success" };
}

export function customerCrmTypeBadgeDisplay(crmType: CustomerCrmType): StatusBadgeDisplay {
  if (crmType === "lead") {
    return { label: "Lead", variant: "info" };
  }
  return { label: "Contact", variant: "secondary" };
}

/** Maps subscription rollup to StatusBadge props; falls back to className for legacy fill colors. */
export function subscriptionRollupBadgeDisplay(
  rollup: CustomerSubscriptionRollup
): StatusBadgeDisplay {
  const legacy = getSubscriptionStatusBadgeDisplay(rollup);
  const variantMap: Partial<Record<CustomerSubscriptionRollup, BadgeVariant>> = {
    active: "success",
    trialing: "success",
    scheduled: "info",
    past_due: "warning",
    unpaid: "warning",
    canceled: "secondary",
    paused: "secondary",
    none: "secondary"
  };
  return {
    label: legacy.label,
    variant: variantMap[rollup] ?? "secondary",
    className: legacy.className
  };
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
      return { label, variant: "success" };
  }
}

export function taskColumnBadgeDisplay(status: string | undefined): StatusBadgeDisplay {
  const column = statusToBoardColumn(status);
  const label = taskBoardColumnLabel(column);
  switch (column) {
    case "done":
      return { label, variant: "success" };
    case "in_progress":
      return { label, variant: "info" };
    case "review":
      return { label, variant: "warning" };
    default:
      return { label, variant: "secondary" };
  }
}
