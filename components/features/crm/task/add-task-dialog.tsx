"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { DateTimePicker } from "@/components/date-time-picker";
import { FormServerError } from "@/components/shared/form-server-error";
import { TaskAssigneeSelect } from "@/components/shared/task-assignee-select";
import {
  TaskCustomerSelect,
  type TaskCustomerOption
} from "@/components/shared/task-customer-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TASK_BOARD_COLUMNS,
  taskBoardColumnLabel,
  type TaskBoardColumnId
} from "@/lib/tasks/task-board-columns";
import {
  DEFAULT_TASK_PRIORITY,
  TASK_PRIORITY_VALUES,
  taskPriorityLabel,
  type TaskPriorityValue
} from "@/lib/tasks/task-priority";
import { TASK_PROGRESS_PERCENT_OPTIONS } from "@/lib/tasks/task-progress-options";
import { createTaskAction } from "@/server/actions/tasks-crm";

export interface AddTaskDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When the user opens from a status tab, that status is pre-selected. */
  defaultColumn?: TaskBoardColumnId;
  defaultCustomerId?: string;
  lockCustomer?: boolean;
  customerOptions?: TaskCustomerOption[];
  disabled?: boolean;
  disabledReason?: string;
}

export function AddTaskDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultColumn = "todo",
  defaultCustomerId,
  lockCustomer,
  customerOptions = [],
  disabled,
  disabledReason
}: AddTaskDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen;

  const [column, setColumn] = React.useState<TaskBoardColumnId>(defaultColumn);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriorityValue>(DEFAULT_TASK_PRIORITY);
  const [progressPercent, setProgressPercent] = React.useState(0);
  const [assignedToUid, setAssignedToUid] = React.useState("");
  const [customerId, setCustomerId] = React.useState("");
  const [dueDate, setDueDate] = React.useState<Date | undefined>();
  const [reminderDate, setReminderDate] = React.useState<Date | undefined>();
  const [pending, setPending] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setColumn(defaultColumn);
      setCustomerId(defaultCustomerId ?? (lockCustomer ? "" : ""));
    }
  }, [open, defaultColumn, defaultCustomerId, lockCustomer]);

  React.useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setPriority(DEFAULT_TASK_PRIORITY);
      setProgressPercent(0);
      setAssignedToUid("");
      setCustomerId("");
      setDueDate(undefined);
      setReminderDate(undefined);
      setServerError(null);
    }
  }, [open]);

  React.useEffect(() => {
    if (open && lockCustomer && defaultCustomerId) {
      setCustomerId(defaultCustomerId);
    }
  }, [open, lockCustomer, defaultCustomerId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setServerError(null);
    setPending(true);

    const resolvedCustomerId = lockCustomer
      ? defaultCustomerId
      : customerId.trim() || undefined;

    const res = await createTaskAction({
      title,
      description: description.trim() || undefined,
      column,
      priority,
      progressPercent,
      assignedToUid: assignedToUid || undefined,
      customerId: resolvedCustomerId,
      dueAt: dueDate ? dueDate.getTime() : undefined,
      reminderAt: reminderDate ? reminderDate.getTime() : undefined
    });
    setPending(false);
    if (!res.ok) {
      setServerError(res.message);
      return;
    }
    onOpenChange(false);
    router.refresh();
  }

  const busy = pending;
  const effectiveCustomerId = lockCustomer ? (defaultCustomerId ?? "") : customerId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col gap-4" noValidate>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <FormServerError message={serverError} />

            {disabled ? (
              <Alert>
                <AlertDescription>
                  {disabledReason ??
                    "Tasks require an organization id on your user profile. Contact an administrator if this persists."}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="task-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="task-title"
                name="title"
                required
                maxLength={500}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design new landing page"
                autoComplete="off"
                disabled={busy || disabled}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TaskPriorityValue)}
                disabled={busy || disabled}>
                <SelectTrigger id="task-priority" className="w-full">
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
              <Label htmlFor="task-column">Status</Label>
              <Select
                value={column}
                onValueChange={(value) => setColumn(value as TaskBoardColumnId)}
                disabled={busy || disabled}>
                <SelectTrigger id="task-column" className="w-full">
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
              <Label htmlFor="task-progress">Progress</Label>
              <Select
                value={String(progressPercent)}
                onValueChange={(value) => setProgressPercent(Number(value))}
                disabled={busy || disabled}>
                <SelectTrigger id="task-progress" className="w-full">
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
              value={assignedToUid}
              onValueChange={setAssignedToUid}
              disabled={busy || disabled}
            />

            <TaskCustomerSelect
              options={customerOptions}
              value={effectiveCustomerId}
              onValueChange={setCustomerId}
              disabled={busy || disabled}
              lockedCustomerId={lockCustomer ? defaultCustomerId : undefined}
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
              <Label htmlFor="task-description">Description (optional)</Label>
              <Textarea
                id="task-description"
                name="description"
                maxLength={8000}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short summary for the card…"
                disabled={busy || disabled}
                className="min-h-[100px] resize-y"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || disabled || !title.trim()}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
