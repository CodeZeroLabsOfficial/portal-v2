"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { DateTimePicker } from "@/components/date-time-picker";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormServerError } from "@/components/shared/form-server-error";
import { TaskAssigneeSelect } from "@/components/shared/task-assignee-select";
import {
  TaskCustomerSelect,
  type TaskCustomerOption
} from "@/components/shared/task-customer-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  TASK_BOARD_COLUMNS,
  statusToBoardColumn,
  taskBoardColumnLabel,
  type TaskBoardColumnId
} from "@/lib/tasks/task-board-columns";
import {
  DEFAULT_TASK_PRIORITY,
  TASK_PRIORITY_VALUES,
  coerceTaskPriority,
  taskPriorityLabel,
  type TaskPriorityValue
} from "@/lib/tasks/task-priority";
import { clampProgressPercent, TASK_PROGRESS_PERCENT_OPTIONS } from "@/lib/tasks/task-progress-options";
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
        <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Edit task</SheetTitle>
          </SheetHeader>
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col gap-4" noValidate>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4">
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
                  placeholder="e.g. Design new landing page"
                  autoComplete="off"
                  disabled={busy || !task}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-task-priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as TaskPriorityValue)}
                  disabled={busy || !task}>
                  <SelectTrigger id="edit-task-priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITY_VALUES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {taskPriorityLabel(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-task-column">Status</Label>
                <Select
                  value={column}
                  onValueChange={(value) => setColumn(value as TaskBoardColumnId)}
                  disabled={busy || !task}>
                  <SelectTrigger id="edit-task-column" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_BOARD_COLUMNS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {taskBoardColumnLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-task-progress">Progress</Label>
                <Select
                  value={String(progressPercent)}
                  onValueChange={(value) => setProgressPercent(Number(value))}
                  disabled={busy || !task}>
                  <SelectTrigger id="edit-task-progress" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PROGRESS_PERCENT_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <TaskAssigneeSelect
                id="edit-task-assignee"
                value={assignedToUid}
                onValueChange={setAssignedToUid}
                disabled={busy || !task}
                allowUnassigned
              />

              <TaskCustomerSelect
                id="edit-task-customer"
                options={customerOptions}
                value={customerId}
                onValueChange={setCustomerId}
                disabled={busy || !task}
              />

              <div className="space-y-1.5">
                <Label>Due date (optional)</Label>
                <DateTimePicker date={dueDate} setDate={setDueDate} />
              </div>

              <div className="space-y-1.5">
                <Label>Reminder (optional)</Label>
                <DateTimePicker date={reminderDate} setDate={setReminderDate} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-task-description">Description (optional)</Label>
                <Textarea
                  id="edit-task-description"
                  name="description"
                  maxLength={8000}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary for the card…"
                  disabled={busy || !task}
                  className="min-h-[100px] resize-y"
                />
              </div>
            </div>

            <SheetFooter className="flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                disabled={busy || !task}
                onClick={() => setConfirmDeleteOpen(true)}>
                Delete
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy || !task || !title.trim()}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save
                </Button>
              </div>
            </SheetFooter>
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
