"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { BellIcon, Calendar, FileIcon, MessageSquare } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { taskColumnBadgeDisplay, taskPriorityBadgeDisplay } from "@/lib/crm/status-badges";
import { statusToBoardColumn } from "@/lib/tasks/task-board-columns";
import { cn } from "@/lib/utils";
import { useTaskStatusMutation } from "@/hooks/use-task-status-mutation";
import type { TaskRecord } from "@/types/task";

export interface TaskTodoItemProps {
  task: TaskRecord;
  viewMode?: "list" | "grid";
  showCustomerLink?: boolean;
  onSelect?: (task: TaskRecord) => void;
  disabled?: boolean;
}

export function TaskTodoItem({
  task,
  viewMode = "list",
  showCustomerLink = true,
  onSelect,
  disabled
}: TaskTodoItemProps) {
  const { moveToColumn, pendingId } = useTaskStatusMutation();
  const column = statusToBoardColumn(task.status);
  const isDone = column === "done";
  const isPending = pendingId === task.id;

  const columnBadge = taskColumnBadgeDisplay(task.status);
  const priorityBadge = taskPriorityBadgeDisplay(task.priority);

  const reminderFormatted =
    typeof task.reminderAt === "number"
      ? format(new Date(task.reminderAt), "MMM d, yyyy - h:mm a")
      : null;

  async function handleCheckboxChange(checked: boolean) {
    if (disabled || isPending) return;
    await moveToColumn(task.id, checked ? "done" : "todo");
  }

  const cardClassName = cn(
    "cursor-pointer gap-0 py-0 transition-shadow hover:shadow-md",
    isDone && "opacity-70",
    isPending && "pointer-events-none opacity-60",
    viewMode === "grid" && "flex h-full flex-col"
  );

  if (viewMode === "grid") {
    return (
      <Card className={cardClassName} onClick={() => onSelect?.(task)}>
        <CardContent className="flex flex-1 flex-col justify-between p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isDone}
                disabled={disabled || isPending}
                onCheckedChange={(checked) => void handleCheckboxChange(checked === true)}
                onClick={(e) => e.stopPropagation()}
              />
              <h3
                className={cn(
                  "text-md flex-1 leading-none font-medium",
                  isDone && "text-muted-foreground line-through"
                )}>
                {task.title}
              </h3>
            </div>

            <div className="text-muted-foreground flex flex-wrap items-center gap-1 text-sm">
              <span>Assigned to:</span>
              {task.assignedToDisplayName ? (
                <Badge variant="outline" className="font-normal">
                  {task.assignedToDisplayName}
                </Badge>
              ) : (
                <span className="text-xs">Unassigned</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {typeof task.dueAt === "number" ? (
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Calendar className="size-3" />
                  <span>{format(new Date(task.dueAt), "MMM d, yyyy")}</span>
                </div>
              ) : null}

              {reminderFormatted ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex items-center gap-1 text-xs"
                        onClick={(e) => e.stopPropagation()}>
                        <BellIcon className="size-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reminder: {reminderFormatted}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null}

              {showCustomerLink && task.customerId ? (
                <Link
                  href={`/admin/customers/${task.customerId}`}
                  className="text-muted-foreground text-xs underline-offset-4 hover:underline"
                  onClick={(e) => e.stopPropagation()}>
                  {task.customerDisplayName ?? "Customer"}
                </Link>
              ) : null}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-between border-t px-4 pt-3 pb-4">
          <div className="flex items-center gap-2 capitalize">
            <StatusBadge label={columnBadge.label} variant={columnBadge.variant} />
            <StatusBadge label={priorityBadge.label} variant={priorityBadge.variant} />
          </div>
          {(task.attachmentCount ?? 0) > 0 ? (
            <div className="flex items-center gap-1">
              <FileIcon className="text-muted-foreground size-3" />
              <span className="text-muted-foreground text-xs">{task.attachmentCount}</span>
            </div>
          ) : null}
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={cardClassName} onClick={() => onSelect?.(task)}>
      <CardContent className="flex items-start gap-3 p-4">
        <Checkbox
          checked={isDone}
          disabled={disabled || isPending}
          onCheckedChange={(checked) => void handleCheckboxChange(checked === true)}
          onClick={(e) => e.stopPropagation()}
        />

        <div className="flex grow flex-col space-y-2">
          <div className="flex flex-col items-start justify-between space-y-1 lg:flex-row lg:space-y-0">
            <h3
              className={cn(
                "text-md leading-none font-medium",
                isDone && "text-muted-foreground line-through"
              )}>
              {task.title}
            </h3>

            <div className="flex items-center gap-2 capitalize">
              <StatusBadge label={columnBadge.label} variant={columnBadge.variant} />
              <StatusBadge label={priorityBadge.label} variant={priorityBadge.variant} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {task.assignedToDisplayName ? (
              <Badge variant="outline" className="font-normal">
                {task.assignedToDisplayName}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-xs">Unassigned</span>
            )}

            {showCustomerLink && task.customerId ? (
              <Link
                href={`/admin/customers/${task.customerId}`}
                className="text-xs underline-offset-4 hover:underline"
                onClick={(e) => e.stopPropagation()}>
                {task.customerDisplayName ?? "Customer"}
              </Link>
            ) : null}

            {typeof task.dueAt === "number" ? (
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Calendar className="size-3" />
                <span>{format(new Date(task.dueAt), "MMM d, yyyy")}</span>
              </div>
            ) : null}

            {reminderFormatted ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs" onClick={(e) => e.stopPropagation()}>
                      <BellIcon className="size-3" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reminder: {reminderFormatted}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}

            {(task.commentCount ?? 0) > 0 ? (
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <MessageSquare className="size-3" />
                <span>{task.commentCount}</span>
              </div>
            ) : null}

            {(task.attachmentCount ?? 0) > 0 ? (
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <FileIcon className="size-3" />
                <span>{task.attachmentCount}</span>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
