"use client";

import * as React from "react";
import Link from "next/link";
import { ListChecks, Plus } from "lucide-react";

import { AddTaskDialog } from "@/components/features/crm/task/add-task-dialog";
import { EditTaskDialog } from "@/components/features/crm/task/edit-task-dialog";
import { TaskTodoItem } from "@/components/features/crm/task/task-todo-item";
import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { CustomerTabSectionCard } from "@/components/features/crm/customer/customer-tab-section-card";
import type { TaskCustomerOption } from "@/components/shared/task-customer-select";
import { Button } from "@/components/ui/button";
import type { CustomerRecord } from "@/types/customer";
import type { TaskRecord } from "@/types/task";

export interface CustomerTasksTabProps {
  customer: CustomerRecord;
  tasks: TaskRecord[];
}

function customerOptionFromRecord(customer: CustomerRecord): TaskCustomerOption {
  return {
    id: customer.id,
    label: [customer.company?.trim(), customer.name?.trim(), customer.email?.trim()]
      .filter(Boolean)
      .join(" · ")
  };
}

export function CustomerTasksTab({ customer, tasks }: CustomerTasksTabProps) {
  const [addOpen, setAddOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TaskRecord | null>(null);

  const customerOptions = React.useMemo(
    () => [customerOptionFromRecord(customer)],
    [customer]
  );

  return (
    <>
      <CustomerTabSectionCard
        title="Tasks"
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="gap-1.5 shadow-sm"
              onClick={() => setAddOpen(true)}>
              <Plus className="size-3.5" aria-hidden />
              Add task
            </Button>
            <Button type="button" size="sm" variant="outline" asChild>
              <Link href="/admin/tasks">View all</Link>
            </Button>
          </div>
        }>
        {tasks.length === 0 ? (
          <CustomerTabEmptyState icon={ListChecks} embedded>
            <p>No tasks linked to this customer yet.</p>
            <p>
              Use <strong className="text-foreground/90">Add task</strong> to create one here, or link a
              customer when creating from the Tasks hub.
            </p>
          </CustomerTabEmptyState>
        ) : (
          tasks.map((task) => (
            <TaskTodoItem
              key={task.id}
              task={task}
              showCustomerLink={false}
              onEdit={(t) => setEditingTask(t)}
            />
          ))
        )}
      </CustomerTabSectionCard>

      <AddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultCustomerId={customer.id}
        lockCustomer
        customerOptions={customerOptions}
      />
      <EditTaskDialog
        open={editingTask !== null}
        onOpenChange={(next) => {
          if (!next) setEditingTask(null);
        }}
        task={editingTask}
        customerOptions={customerOptions}
      />
    </>
  );
}
