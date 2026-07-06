"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Edit, FileIcon, MessageSquare } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { sheetContentClass, sheetFormClass } from "@/components/shared/sheet-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { taskColumnBadgeDisplay, taskPriorityBadgeDisplay } from "@/lib/crm/status-badges";
import { clampProgressPercent } from "@/lib/tasks/task-progress-options";
import type { TaskRecord } from "@/types/task";

export interface TaskDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskRecord | null;
  onEditClick?: (task: TaskRecord) => void;
  showCustomerLink?: boolean;
}

export function TaskDetailSheet({
  open,
  onOpenChange,
  task,
  onEditClick,
  showCustomerLink = true
}: TaskDetailSheetProps) {
  if (!task) return null;

  const columnBadge = taskColumnBadgeDisplay(task.status);
  const priorityBadge = taskPriorityBadgeDisplay(task.priority);
  const progress = clampProgressPercent(task.progressPercent);
  const assigneeName = task.assignedToDisplayName?.trim();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={sheetContentClass}>
        <SheetHeader>
          <div className="flex items-start justify-between pe-6">
            <SheetTitle className="text-left">{task.title}</SheetTitle>
            {onEditClick ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEditClick(task)}>
                <Edit className="size-4" />
                Edit
              </Button>
            ) : null}
          </div>
          <div className="flex items-center gap-2 capitalize">
            <StatusBadge label={columnBadge.label} variant={columnBadge.variant} />
            <StatusBadge label={priorityBadge.label} variant={priorityBadge.variant} />
          </div>
          <div className="mt-4 w-full space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="task-progress">Task Progress</Label>
              <span className="text-muted-foreground text-sm">{progress}%</span>
            </div>
            <Progress id="task-progress" value={progress} />
          </div>
        </SheetHeader>

        <div className={sheetFormClass}>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-muted-foreground text-sm">
              {task.description?.trim() || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Assigned To</h4>
              <p className="text-muted-foreground text-sm">
                {assigneeName || "Unassigned"}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Due Date</h4>
              <p className="text-muted-foreground text-sm">
                {typeof task.dueAt === "number"
                  ? format(new Date(task.dueAt), "PPP")
                  : "—"}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Reminder Date</h4>
              <p className="text-muted-foreground text-sm">
                {typeof task.reminderAt === "number"
                  ? format(new Date(task.reminderAt), "PPP")
                  : "—"}
              </p>
            </div>

            {showCustomerLink ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Customer</h4>
                {task.customerId ? (
                  <Link
                    href={`/admin/customers/${task.customerId}`}
                    className="text-muted-foreground text-sm underline-offset-4 hover:underline">
                    {task.customerDisplayName ?? "View customer"}
                  </Link>
                ) : (
                  <p className="text-muted-foreground text-sm">—</p>
                )}
              </div>
            ) : null}
          </div>

          {((task.commentCount ?? 0) > 0 || (task.attachmentCount ?? 0) > 0) ? (
            <>
              <Separator />
              <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                {(task.commentCount ?? 0) > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="size-4" />
                    {task.commentCount} comment{(task.commentCount ?? 0) === 1 ? "" : "s"}
                  </span>
                ) : null}
                {(task.attachmentCount ?? 0) > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <FileIcon className="size-4" />
                    {task.attachmentCount} attachment{(task.attachmentCount ?? 0) === 1 ? "" : "s"}
                  </span>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
