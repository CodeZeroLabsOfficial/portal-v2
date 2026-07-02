"use client";

import * as React from "react";
import { LayoutGrid, List, ListTodo, Plus } from "lucide-react";

import { AddTaskDialog } from "@/components/features/crm/task/add-task-dialog";
import { EditTaskDialog } from "@/components/features/crm/task/edit-task-dialog";
import { TasksBoard } from "@/components/features/crm/task/tasks-board";
import { TasksListTable } from "@/components/features/crm/task/tasks-list-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { coerceTaskPriority } from "@/lib/tasks/task-priority";
import { statusToBoardColumn, type TaskBoardColumnId } from "@/lib/tasks/task-board-columns";
import { cn } from "@/lib/utils";
import type { TaskRecord } from "@/types/task";

export type TaskHubFilterTab = "all" | "my" | "high_priority" | "closing_soon";

const DAY_MS = 24 * 60 * 60 * 1000;

const TAB_LABELS: { id: TaskHubFilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "my", label: "My" },
  { id: "high_priority", label: "High priority" },
  { id: "closing_soon", label: "Closing soon" }
];

function filterTasksForTab(tasks: TaskRecord[], tab: TaskHubFilterTab, viewerUid: string): TaskRecord[] {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  switch (tab) {
    case "all":
      return tasks;
    case "my":
      return tasks.filter((t) => t.assignedToUid === viewerUid);
    case "high_priority":
      return tasks.filter((t) => coerceTaskPriority(t.priority) === "high");
    case "closing_soon":
      return tasks.filter((t) => {
        const col = statusToBoardColumn(t.status);
        const dueSoon =
          typeof t.dueAt === "number" && t.dueAt <= now + weekMs && t.dueAt >= now - DAY_MS;
        return col === "review" || dueSoon;
      });
    default:
      return tasks;
  }
}

export interface TasksPanelProps {
  tasks: TaskRecord[];
  viewerUid: string;
  /** Required to create tasks (Firestore `organizationId` on new rows). */
  organizationId?: string;
}

export function TasksPanel({ tasks, viewerUid, organizationId }: TasksPanelProps) {
  const [mode, setMode] = React.useState<"board" | "list">("board");
  const [filterTab, setFilterTab] = React.useState<TaskHubFilterTab>("all");
  const [addOpen, setAddOpen] = React.useState(false);
  const [addDefaultColumn, setAddDefaultColumn] = React.useState<TaskBoardColumnId>("todo");
  const [editingTask, setEditingTask] = React.useState<TaskRecord | null>(null);

  const canCreateTasks = Boolean(organizationId);

  function openAddDialog(column: TaskBoardColumnId) {
    setAddDefaultColumn(column);
    setAddOpen(true);
  }

  const filtered = React.useMemo(
    () => filterTasksForTab(tasks, filterTab, viewerUid),
    [tasks, filterTab, viewerUid]
  );

  if (!organizationId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tasks"
          description="Stay on top of assignments and deadlines."
        />
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
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Drag cards between columns or switch to list view to change status from the dropdown."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!canCreateTasks}
              title={
                !canCreateTasks
                  ? "Your user profile must include an organization id to create tasks."
                  : undefined
              }
              onClick={() => openAddDialog("todo")}>
              <Plus />
              Add task
            </Button>
            <div className="flex rounded-lg border border-border/80 bg-muted/30 p-0.5">
              <Button
                type="button"
                variant={mode === "board" ? "secondary" : "ghost"}
                size="sm"
                className={cn("gap-1.5", mode === "board" && "shadow-sm")}
                onClick={() => setMode("board")}>
                <LayoutGrid className="h-4 w-4" aria-hidden />
                Board
              </Button>
              <Button
                type="button"
                variant={mode === "list" ? "secondary" : "ghost"}
                size="sm"
                className={cn("gap-1.5", mode === "list" && "shadow-sm")}
                onClick={() => setMode("list")}>
                <List className="h-4 w-4" aria-hidden />
                List
              </Button>
            </div>
          </div>
        }
      />

      <div className="flex flex-wrap gap-1 border-b border-border/60">
        {TAB_LABELS.map((tab) => {
          const active = filterTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              className={cn(
                "-mb-px px-3 pb-2 pt-1 text-sm transition-colors",
                active
                  ? "border-b-2 border-foreground font-semibold text-foreground"
                  : "border-b-2 border-transparent font-medium text-muted-foreground hover:text-foreground"
              )}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {mode === "board" ? (
        <TasksBoard
          tasks={filtered}
          onRequestAddToColumn={openAddDialog}
          addDisabled={!canCreateTasks}
          onRequestEditTask={(t) => setEditingTask(t)}
        />
      ) : (
        <TasksListTable tasks={filtered} onRequestEditTask={(t) => setEditingTask(t)} />
      )}

      <AddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultColumn={addDefaultColumn}
        disabled={!canCreateTasks}
        disabledReason="Your user profile must include an organization id before you can add tasks."
      />
      <EditTaskDialog
        open={editingTask !== null}
        onOpenChange={(next) => {
          if (!next) setEditingTask(null);
        }}
        task={editingTask}
      />
    </div>
  );
}
