"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormServerError } from "@/components/shared/form-server-error";
import {
  sheetContentClass,
  sheetFormClass,
} from "@/components/shared/sheet-layout";
import { TaskAssigneeField } from "@/components/shared/task-assignee-field";
import {
  TaskCustomerSelect,
  type TaskCustomerOption
} from "@/components/shared/task-customer-select";
import { TaskDatePicker } from "@/components/shared/task-date-picker";
import { TaskStatusPriorityFields } from "@/components/shared/task-status-priority-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  statusToBoardColumn,
  type TaskBoardColumnId
} from "@/lib/tasks/task-board-columns";
import {
  DEFAULT_TASK_PRIORITY,
  coerceTaskPriority,
  type TaskPriorityValue
} from "@/lib/tasks/task-priority";
import { clampProgressPercent } from "@/lib/tasks/task-progress-options";
import { deleteTaskAction, updateTaskAction } from "@/server/actions/tasks-crm";
import type { TaskRecord } from "@/types/task";

export interface TaskEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskRecord | null;
  customerOptions?: TaskCustomerOption[];
}

export function TaskEditSheet({
  open,
  onOpenChange,
  task,
  customerOptions = []
}: TaskEditSheetProps) {
  const router = useRouter();
  const [column, setColumn] = React.useState<TaskBoardColumnId>("todo");
  const [title, setTitle] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriorityValue>(DEFAULT_TASK_PRIORITY);
  const [progressPercent, setProgressPercent] = React.useState(0);
  const [description, setDescription] = React.useState("");
  const [assignedToUid, setAssignedToUid] = React.useState("");
  const [customerId, setCustomerId] = React.useState("");
  const [dueDate, setDueDate] = React.useState<Date | undefined>();
  const [reminderDate, setReminderDate] = React.useState<Date | undefined>();
  const [pending, setPending] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open || !task) return;
    setTitle(task.title);
    setPriority(coerceTaskPriority(task.priority));
    setProgressPercent(clampProgressPercent(task.progressPercent));
    setDescription(task.description ?? "");
    setColumn(statusToBoardColumn(task.status));
    setAssignedToUid(task.assignedToUid ?? "");
    setCustomerId(task.customerId ?? "");
    setDueDate(typeof task.dueAt === "number" ? new Date(task.dueAt) : undefined);
    setReminderDate(typeof task.reminderAt === "number" ? new Date(task.reminderAt) : undefined);
    setServerError(null);
  }, [open, task]);

  React.useEffect(() => {
    if (!open) {
      setServerError(null);
      setConfirmDeleteOpen(false);
    }
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!task) return;
    setServerError(null);
    setPending(true);
    const res = await updateTaskAction({
      taskId: task.id,
      title,
      description: description.trim() || undefined,
      column,
      priority,
      progressPercent,
      assignedToUid,
      customerId: customerId || null,
      dueAt: dueDate ? dueDate.getTime() : null,
      reminderAt: reminderDate ? reminderDate.getTime() : null
    });
    setPending(false);
    if (!res.ok) {
      setServerError(res.message);
      return;
    }
    onOpenChange(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!task) return;
    const res = await deleteTaskAction(task.id);
    if (!res.ok) throw new Error(res.message);
    onOpenChange(false);
    router.refresh();
  }

  const busy = pending;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className={sheetContentClass}>
          <SheetHeader>
            <SheetTitle>Edit Task</SheetTitle>
          </SheetHeader>

          <form onSubmit={onSubmit} className={sheetFormClass} noValidate>
            <FormServerError message={serverError} />

            <div className="space-y-1.5">
              <Label htmlFor="edit-task-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-task-title"
                name="title"
                required
                maxLength={500}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                autoComplete="off"
                disabled={busy || !task}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-task-description">Description</Label>
              <Textarea
                id="edit-task-description"
                name="description"
                maxLength={8000}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                disabled={busy || !task}
              />
            </div>

            <TaskAssigneeField
              id="edit-task-assignee"
              value={assignedToUid}
              onValueChange={setAssignedToUid}
              disabled={busy || !task}
              allowUnassigned
              displayNameHint={task?.assignedToDisplayName}
            />

            <TaskDatePicker
              id="edit-task-due"
              label="Due Date"
              date={dueDate}
              onDateChange={setDueDate}
              disabled={busy || !task}
            />

            <TaskDatePicker
              id="edit-task-reminder"
              label="Reminder Date"
              date={reminderDate}
              onDateChange={setReminderDate}
              disabled={busy || !task}
            />

            <TaskStatusPriorityFields
              status={column}
              onStatusChange={setColumn}
              priority={priority}
              onPriorityChange={setPriority}
              disabled={busy || !task}
              statusId="edit-task-status"
              priorityId="edit-task-priority"
            />

            <TaskCustomerSelect
              id="edit-task-customer"
              options={customerOptions}
              value={customerId}
              onValueChange={setCustomerId}
              disabled={busy || !task}
            />

            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="destructive"
                disabled={busy || !task}
                onClick={() => setConfirmDeleteOpen(true)}>
                Delete task
              </Button>
              <Button type="submit" disabled={busy || !task || !title.trim()}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete task"
        description={
          task
            ? `Delete "${task.title}" permanently? This cannot be undone.`
            : "Delete this task permanently? This cannot be undone."
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}
