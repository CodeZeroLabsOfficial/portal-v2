"use client";

import * as React from "react";
import { LayoutGrid, List, ListTodo, Search, SlidersHorizontal, X } from "lucide-react";

import { TaskTodoItem } from "@/components/features/crm/task/task-todo-item";
import {
  TaskStatusTabs,
  type TaskStatusFilterTab
} from "@/components/features/crm/task/task-status-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  coerceTaskPriority,
  TASK_PRIORITY_DOT_CLASSES,
  TASK_PRIORITY_VALUES,
  taskPriorityLabel,
  type TaskPriorityValue
} from "@/lib/tasks/task-priority";
import { statusToBoardColumn } from "@/lib/tasks/task-board-columns";
import { cn } from "@/lib/utils";
import type { TaskRecord } from "@/types/task";

const DAY_MS = 24 * 60 * 60 * 1000;

interface TaskAssigneeOption {
  uid: string;
  displayName: string;
}

function collectAssigneeOptions(tasks: TaskRecord[]): TaskAssigneeOption[] {
  const map = new Map<string, string>();
  for (const task of tasks) {
    const uid = task.assignedToUid?.trim();
    if (!uid) continue;
    const label = task.assignedToDisplayName?.trim() || uid;
    map.set(uid, label);
  }
  return [...map.entries()]
    .map(([uid, displayName]) => ({ uid, displayName }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }));
}

function filterTasksByStatusTab(tasks: TaskRecord[], tab: TaskStatusFilterTab): TaskRecord[] {
  if (tab === "all") return tasks;
  return tasks.filter((t) => statusToBoardColumn(t.status) === tab);
}

function filterTasksByAssignees(tasks: TaskRecord[], uids: string[] | null): TaskRecord[] {
  if (!uids || uids.length === 0) return tasks;
  return tasks.filter((t) => t.assignedToUid && uids.includes(t.assignedToUid));
}

function filterTasksByPriority(
  tasks: TaskRecord[],
  priority: TaskPriorityValue | null
): TaskRecord[] {
  if (!priority) return tasks;
  return tasks.filter((t) => coerceTaskPriority(t.priority) === priority);
}

function filterTasksClosingSoon(tasks: TaskRecord[], enabled: boolean): TaskRecord[] {
  if (!enabled) return tasks;
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return tasks.filter((t) => {
    const col = statusToBoardColumn(t.status);
    const dueSoon =
      typeof t.dueAt === "number" && t.dueAt <= now + weekMs && t.dueAt >= now - DAY_MS;
    return col === "review" || dueSoon;
  });
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

export interface TaskTodoListProps {
  tasks: TaskRecord[];
  viewerUid: string;
  onSelectTask?: (task: TaskRecord) => void;
  defaultStatusTab?: TaskStatusFilterTab;
  showViewToggle?: boolean;
}

export function TaskTodoList({
  tasks,
  viewerUid,
  onSelectTask,
  defaultStatusTab = "all",
  showViewToggle = true
}: TaskTodoListProps) {
  const [statusTab, setStatusTab] = React.useState<TaskStatusFilterTab>(defaultStatusTab);
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");
  const [filterAssigneeUids, setFilterAssigneeUids] = React.useState<string[] | null>(null);
  const [filterPriority, setFilterPriority] = React.useState<TaskPriorityValue | null>(null);
  const [closingSoonOnly, setClosingSoonOnly] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const assigneeOptions = React.useMemo(() => collectAssigneeOptions(tasks), [tasks]);

  const filtered = React.useMemo(() => {
    let result = tasks;
    result = filterTasksByStatusTab(result, statusTab);
    result = filterTasksByAssignees(result, filterAssigneeUids);
    result = filterTasksByPriority(result, filterPriority);
    result = filterTasksClosingSoon(result, closingSoonOnly);
    result = filterTasksBySearch(result, searchQuery);
    return result;
  }, [tasks, statusTab, filterAssigneeUids, filterPriority, closingSoonOnly, searchQuery]);

  const activeFilterCount =
    (filterAssigneeUids?.length ?? 0) +
    (filterPriority ? 1 : 0) +
    (closingSoonOnly ? 1 : 0);

  function handleAssigneeToggle(uid: string, pressed: boolean) {
    setFilterAssigneeUids((current) => {
      const existing = current ?? [];
      if (pressed) {
        return [...existing, uid];
      }
      const next = existing.filter((id) => id !== uid);
      return next.length > 0 ? next : null;
    });
  }

  function clearFilters() {
    setFilterAssigneeUids(null);
    setFilterPriority(null);
    setClosingSoonOnly(false);
    setSearchQuery("");
  }

  const filterContent = (
    <div className="space-y-6 p-4">
      {assigneeOptions.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Assigned users</h4>
          <div className="flex flex-wrap gap-2">
            {assigneeOptions.map((opt) => (
              <Toggle
                key={opt.uid}
                variant="outline"
                size="sm"
                pressed={filterAssigneeUids?.includes(opt.uid) ?? false}
                onPressedChange={(pressed) => handleAssigneeToggle(opt.uid, pressed)}
                className="px-3 text-xs">
                {opt.displayName}
              </Toggle>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Quick filters</h4>
        <Toggle
          variant="outline"
          size="sm"
          pressed={filterAssigneeUids?.length === 1 && filterAssigneeUids[0] === viewerUid}
          onPressedChange={(pressed) =>
            setFilterAssigneeUids(pressed ? [viewerUid] : null)
          }
          className="px-3 text-xs">
          My tasks
        </Toggle>
        <Toggle
          variant="outline"
          size="sm"
          pressed={closingSoonOnly}
          onPressedChange={setClosingSoonOnly}
          className="ms-2 px-3 text-xs">
          Closing soon
        </Toggle>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Priority</h4>
        <div className="flex gap-2 *:grow">
          {TASK_PRIORITY_VALUES.map((priority) => (
            <Toggle
              key={priority}
              variant="outline"
              size="sm"
              pressed={filterPriority === priority}
              onPressedChange={() =>
                setFilterPriority((current) => (current === priority ? null : priority))
              }
              className="px-3 text-xs capitalize">
              <span className={cn("size-2 rounded-full", TASK_PRIORITY_DOT_CLASSES[priority])} />
              {taskPriorityLabel(priority)}
            </Toggle>
          ))}
        </div>

        {activeFilterCount > 0 ? (
          <div className="text-end">
            <Button variant="link" size="sm" className="px-0!" onClick={clearFilters}>
              Clear filters
              <X className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <TaskStatusTabs activeTab={statusTab} onTabChange={setStatusTab} />

        <div className="flex w-full items-center gap-2 lg:w-auto">
          <div className="relative w-auto flex-1 lg:flex-none">
            <Search className="absolute top-2.5 left-3 size-4 opacity-50" />
            <Input
              placeholder="Search tasks..."
              className="ps-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="relative shrink-0">
                <SlidersHorizontal className="size-4" />
                {activeFilterCount > 0 ? (
                  <Badge
                    variant="secondary"
                    className="absolute -end-1.5 -top-1.5 size-4 rounded-full p-0 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end">
              {filterContent}
            </DropdownMenuContent>
          </DropdownMenu>

          {showViewToggle ? (
            <ToggleGroup
              type="single"
              variant="outline"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as "list" | "grid")}>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListTodo />
            </EmptyMedia>
            <EmptyTitle>No tasks found</EmptyTitle>
            <EmptyDescription>
              Try a different status tab, search term, or filter — or add a new task.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((task) => (
            <TaskTodoItem
              key={task.id}
              task={task}
              viewMode="grid"
              showCustomerLink
              onSelect={onSelectTask}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 space-y-4">
          {filtered.map((task) => (
            <TaskTodoItem
              key={task.id}
              task={task}
              viewMode="list"
              showCustomerLink
              onSelect={onSelectTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
