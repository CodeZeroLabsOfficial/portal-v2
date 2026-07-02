"use client";

import * as React from "react";
import { ListTodo, Plus } from "lucide-react";

import { AddTaskDialog } from "@/components/features/crm/task/add-task-dialog";
import { EditTaskDialog } from "@/components/features/crm/task/edit-task-dialog";
import { TasksBoard } from "@/components/features/crm/task/tasks-board";
import { TasksListTable } from "@/components/features/crm/task/tasks-list-table";
import { KanbanBoardToolbar } from "@/components/shared/kanban-board-toolbar";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { coerceTaskPriority } from "@/lib/tasks/task-priority";
import { statusToBoardColumn, type TaskBoardColumnId } from "@/lib/tasks/task-board-columns";
import type { TaskRecord } from "@/types/task";

export type TaskHubFilterTab = "all" | "my" | "high_priority" | "closing_soon";

const DAY_MS = 24 * 60 * 60 * 1000;

const FILTER_TABS: { id: TaskHubFilterTab; label: string }[] = [
  { id: "all", label: "All tasks" },
  { id: "my", label: "My tasks" },
  { id: "high_priority", label: "High priority" },
  { id: "closing_soon", label: "Closing soon" }
];

const PRIORITY_FILTERS = ["high", "medium", "low"] as const;
type TaskPriorityFilter = (typeof PRIORITY_FILTERS)[number];

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

function filterTasksBySearch(tasks: TaskRecord[], query: string): TaskRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter((t) => {
    const title = t.title.toLowerCase();
    const description = (t.description ?? "").toLowerCase();
    const category = (t.category ?? "").toLowerCase();
    return title.includes(q) || description.includes(q) || category.includes(q);
  });
}

function filterTasksByPriority(tasks: TaskRecord[], priority: TaskPriorityFilter | null): TaskRecord[] {
  if (!priority) return tasks;
  return tasks.filter((t) => coerceTaskPriority(t.priority) === priority);
}

export interface TasksPanelProps {
  tasks: TaskRecord[];
  viewerUid: string;
  organizationId?: string;
}

export function TasksPanel({ tasks, viewerUid, organizationId }: TasksPanelProps) {
  const [filterTab, setFilterTab] = React.useState<TaskHubFilterTab>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<TaskPriorityFilter | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [addDefaultColumn, setAddDefaultColumn] = React.useState<TaskBoardColumnId>("todo");
  const [editingTask, setEditingTask] = React.useState<TaskRecord | null>(null);

  const canCreateTasks = Boolean(organizationId);

  function openAddDialog(column: TaskBoardColumnId) {
    setAddDefaultColumn(column);
    setAddOpen(true);
  }

  const filtered = React.useMemo(() => {
    let result = filterTasksForTab(tasks, filterTab, viewerUid);
    result = filterTasksByPriority(result, priorityFilter);
    result = filterTasksBySearch(result, searchQuery);
    return result;
  }, [tasks, filterTab, viewerUid, priorityFilter, searchQuery]);

  const activeFilterCount =
    (filterTab !== "all" ? 1 : 0) + (priorityFilter ? 1 : 0);

  function clearFilters() {
    setFilterTab("all");
    setPriorityFilter(null);
  }

  const filterContent = (
    <Command>
      <CommandList>
        <CommandEmpty>No filters found.</CommandEmpty>
        <CommandGroup heading="View">
          {FILTER_TABS.map((tab) => (
            <CommandItem
              key={tab.id}
              onSelect={() => setFilterTab(tab.id)}>
              <span>{tab.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Priority">
          {PRIORITY_FILTERS.map((p) => (
            <CommandItem key={p} onSelect={() => setPriorityFilter(p)}>
              <span className="capitalize">{p}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup>
          <CommandItem onSelect={clearFilters} className="justify-center text-center">
            Clear filters
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );

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
        description="Drag cards between columns or switch to list view."
        actions={
          <Button
            type="button"
            disabled={!canCreateTasks}
            title={
              !canCreateTasks
                ? "Your user profile must include an organization id to create tasks."
                : undefined
            }
            onClick={() => openAddDialog("todo")}>
            <Plus />
            <span className="hidden lg:inline">Add task</span>
          </Button>
        }
      />

      <Tabs defaultValue="board" className="w-full">
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>

          <KanbanBoardToolbar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            searchPlaceholder="Search tasks…"
            activeFilterCount={activeFilterCount}
            filterContent={filterContent}
          />
        </div>

        <TabsContent value="board">
          <TasksBoard
            tasks={filtered}
            onRequestAddToColumn={openAddDialog}
            addDisabled={!canCreateTasks}
            onRequestEditTask={(t) => setEditingTask(t)}
          />
        </TabsContent>
        <TabsContent value="list">
          <TasksListTable tasks={filtered} onRequestEditTask={(t) => setEditingTask(t)} />
        </TabsContent>
      </Tabs>

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
