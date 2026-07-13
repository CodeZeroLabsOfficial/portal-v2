"use client";

import * as React from "react";
import { ListTodo, Plus } from "lucide-react";

import { TaskAddSheet } from "@/components/features/crm/task/task-add-sheet";
import { TaskDetailSheet } from "@/components/features/crm/task/task-detail-sheet";
import { TaskEditSheet } from "@/components/features/crm/task/task-edit-sheet";
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
  const [detailTask, setDetailTask] = React.useState<TaskRecord | null>(null);
  const [editingTask, setEditingTask] = React.useState<TaskRecord | null>(null);

  const canCreateTasks = Boolean(organizationId);

  if (!organizationId) {
    return (
      <div className="space-y-4">
        <PageHeader title="Tasks" description="Assignments, due dates, and follow-ups" />
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
        description="Assignments, due dates, and follow-ups"
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
        onSelectTask={(t) => setDetailTask(t)}
      />

      <TaskDetailSheet
        open={detailTask !== null}
        onOpenChange={(next) => {
          if (!next) setDetailTask(null);
        }}
        task={detailTask}
        onEditClick={(task) => {
          setDetailTask(null);
          setEditingTask(task);
        }}
      />
      <TaskEditSheet
        open={editingTask !== null}
        onOpenChange={(next) => {
          if (!next) setEditingTask(null);
        }}
        task={editingTask}
        customerOptions={customerOptions}
      />
      <TaskAddSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultColumn="todo"
        customerOptions={customerOptions}
        disabled={!canCreateTasks}
        disabledReason="Your user profile must include an organization id before you can add tasks."
      />
    </div>
  );
}
