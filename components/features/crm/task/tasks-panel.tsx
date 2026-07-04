"use client";

import * as React from "react";
import { ListTodo, Plus } from "lucide-react";

import { AddTaskDialog } from "@/components/features/crm/task/add-task-dialog";
import { EditTaskDialog } from "@/components/features/crm/task/edit-task-dialog";
import { TaskTodoList } from "@/components/features/crm/task/task-todo-list";
import type { TaskCustomerOption } from "@/components/shared/task-customer-select";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import type { TaskRecord } from "@/types/task";

export interface TasksPanelProps {
  tasks: TaskRecord[];
  viewerUid: string;
  organizationId?: string;
  customerOptions: TaskCustomerOption[];
}

export function TasksPanel({
  tasks,
  viewerUid,
  organizationId,
  customerOptions
}: TasksPanelProps) {
  const [addOpen, setAddOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TaskRecord | null>(null);

  const canCreateTasks = Boolean(organizationId);

  if (!organizationId) {
    return (
      <div className="space-y-4">
        <PageHeader title="Tasks" description="Stay on top of assignments and deadlines." />
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListTodo />
            </EmptyMedia>
            <EmptyTitle>Organization required</EmptyTitle>
            <EmptyDescription>
              Your user profile must include an organization id before tasks can be listed or created.
              Contact an administrator if this persists.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tasks"
        description="Track assignments, due dates, and customer-linked work."
        actions={
          <Button
            type="button"
            disabled={!canCreateTasks}
            title={
              !canCreateTasks
                ? "Your user profile must include an organization id to create tasks."
                : undefined
            }
            onClick={() => setAddOpen(true)}>
            <Plus />
            <span className="hidden lg:inline">Add task</span>
          </Button>
        }
      />

      <TaskTodoList
        tasks={tasks}
        viewerUid={viewerUid}
        onRequestEditTask={(t) => setEditingTask(t)}
      />

      <AddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultColumn="todo"
        customerOptions={customerOptions}
        disabled={!canCreateTasks}
        disabledReason="Your user profile must include an organization id before you can add tasks."
      />
      <EditTaskDialog
        open={editingTask !== null}
        onOpenChange={(next) => {
          if (!next) setEditingTask(null);
        }}
        task={editingTask}
        customerOptions={customerOptions}
      />
    </div>
  );
}
