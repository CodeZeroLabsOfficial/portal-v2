import type { VariantProps } from "class-variance-authority";

import { coerceTaskPriority, taskPriorityLabel } from "@/lib/tasks/task-priority";
import { taskBoardColumnLabel, statusToBoardColumn } from "@/lib/tasks/task-board-columns";
import type { badgeVariants } from "@/components/ui/badge";
import type { CustomerCrmType } from "@/types/customer";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export interface StatusBadgeDisplay {
  label: string;
  variant: BadgeVariant;
  /** Leading dot. Customer, subscription, and template status only. */
  dot?: boolean;
}

export function customerStatusBadgeDisplay(status: "active" | "archived"): StatusBadgeDisplay {
  if (status === "archived") {
    return { label: "Archived", variant: "destructive", dot: true };
  }
  return { label: "Active", variant: "success", dot: true };
}

export function customerCrmTypeBadgeDisplay(crmType: CustomerCrmType): StatusBadgeDisplay {
  if (crmType === "lead") {
    return { label: "Lead", variant: "amber" };
  }
  return { label: "Contact", variant: "sky" };
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
      return { label, variant: "amber" };
    default:
      return { label, variant: "sky" };
  }
}
