import { ListChecks } from "lucide-react";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { taskColumnBadgeDisplay } from "@/lib/crm/status-badges";
import type { TaskRecord } from "@/types/task";

export interface CustomerTasksTabProps {
  tasks: TaskRecord[];
}

export function CustomerTasksTab({ tasks }: CustomerTasksTabProps) {
  if (tasks.length === 0) {
    return (
      <CustomerTabEmptyState icon={ListChecks}>
        <p>No tasks linked to this customer yet.</p>
        <p>
          Add tasks from your operational board with <span className="font-mono">customerId</span> set to
          this customer.
        </p>
      </CustomerTabEmptyState>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => {
        const columnBadge = taskColumnBadgeDisplay(task.status);
        return (
          <li
            key={task.id}
            className="border-border/60 bg-card/50 flex items-center justify-between rounded-xl border px-4 py-3">
            <span className="font-medium">{task.title}</span>
            <StatusBadge label={columnBadge.label} variant={columnBadge.variant} className="capitalize" />
          </li>
        );
      })}
    </ul>
  );
}
