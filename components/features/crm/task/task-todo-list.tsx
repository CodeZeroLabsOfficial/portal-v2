"use client";

import * as React from "react";
import { ListTodo, Search, SlidersHorizontal } from "lucide-react";

import { TaskTodoItem } from "@/components/features/crm/task/task-todo-item";
import {
  TaskStatusTabs,
  type TaskStatusFilterTab
} from "@/components/features/crm/task/task-status-tabs";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

function filterTasksForHubTab(
  tasks: TaskRecord[],
  tab: TaskHubFilterTab,
  viewerUid: string
): TaskRecord[] {
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

function filterTasksByStatusTab(tasks: TaskRecord[], tab: TaskStatusFilterTab): TaskRecord[] {
  if (tab === "all") return tasks;
  return tasks.filter((t) => statusToBoardColumn(t.status) === tab);
}

function filterTasksBySearch(tasks: TaskRecord[], query: string): TaskRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter((t) => {
    const title = t.title.toLowerCase();
    const description = (t.description ?? "").toLowerCase();
    const category = (t.category ?? "").toLowerCase();
    const customer = (t.customerDisplayName ?? "").toLowerCase();
    const assignee = (t.assignedToDisplayName ?? "").toLowerCase();
    return (
      title.includes(q) ||
      description.includes(q) ||
      category.includes(q) ||
      customer.includes(q) ||
      assignee.includes(q)
    );
  });
}

function filterTasksByPriority(
  tasks: TaskRecord[],
  priority: TaskPriorityFilter | null
): TaskRecord[] {
  if (!priority) return tasks;
  return tasks.filter((t) => coerceTaskPriority(t.priority) === priority);
}

export interface TaskTodoListProps {
  tasks: TaskRecord[];
  viewerUid: string;
  onRequestEditTask?: (task: TaskRecord) => void;
  defaultStatusTab?: TaskStatusFilterTab;
}

export function TaskTodoList({
  tasks,
  viewerUid,
  onRequestEditTask,
  defaultStatusTab = "all"
}: TaskTodoListProps) {
  const [statusTab, setStatusTab] = React.useState<TaskStatusFilterTab>(defaultStatusTab);
  const [hubFilterTab, setHubFilterTab] = React.useState<TaskHubFilterTab>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<TaskPriorityFilter | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let result = filterTasksForHubTab(tasks, hubFilterTab, viewerUid);
    result = filterTasksByStatusTab(result, statusTab);
    result = filterTasksByPriority(result, priorityFilter);
    result = filterTasksBySearch(result, searchQuery);
    return result;
  }, [tasks, hubFilterTab, viewerUid, statusTab, priorityFilter, searchQuery]);

  const activeFilterCount =
    (hubFilterTab !== "all" ? 1 : 0) + (priorityFilter ? 1 : 0);

  function clearFilters() {
    setHubFilterTab("all");
    setPriorityFilter(null);
  }

  const filterContent = (
    <Command>
      <CommandList>
        <CommandEmpty>No filters found.</CommandEmpty>
        <CommandGroup heading="View">
          {FILTER_TABS.map((tab) => (
            <CommandItem key={tab.id} onSelect={() => setHubFilterTab(tab.id)}>
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <TaskStatusTabs activeTab={statusTab} onTabChange={setStatusTab} />

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search tasks…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative shrink-0">
                <SlidersHorizontal className="size-4" />
                {activeFilterCount > 0 ? (
                  <Badge className="absolute -top-1 -right-1 size-4 rounded-full p-0 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              {filterContent}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListTodo />
            </EmptyMedia>
            <EmptyTitle>No tasks match</EmptyTitle>
            <EmptyDescription>
              Try a different status tab, search term, or filter — or add a new task.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <TaskTodoItem
              key={task.id}
              task={task}
              showCustomerLink
              onEdit={onRequestEditTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
