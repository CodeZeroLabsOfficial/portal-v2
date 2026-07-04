"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { FormServerError } from "@/components/shared/form-server-error";
import { TaskAssigneeField } from "@/components/shared/task-assignee-field";
import {
  TaskCustomerSelect,
  type TaskCustomerOption
} from "@/components/shared/task-customer-select";
import { TaskDatePicker } from "@/components/shared/task-date-picker";
import { TaskStatusPriorityFields } from "@/components/shared/task-status-priority-fields";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { type TaskBoardColumnId } from "@/lib/tasks/task-board-columns";
import {
  DEFAULT_TASK_PRIORITY,
  type TaskPriorityValue
} from "@/lib/tasks/task-priority";
import { TASK_PROGRESS_PERCENT_OPTIONS } from "@/lib/tasks/task-progress-options";
import { createTaskAction } from "@/server/actions/tasks-crm";

export interface TaskAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultColumn?: TaskBoardColumnId;
  defaultCustomerId?: string;
  lockCustomer?: boolean;
  customerOptions?: TaskCustomerOption[];
  disabled?: boolean;
  disabledReason?: string;
}

export function TaskAddSheet({
  open,
  onOpenChange,
  defaultColumn = "todo",
  defaultCustomerId,
  lockCustomer,
  customerOptions = [],
  disabled,
  disabledReason
}: TaskAddSheetProps) {
  const router = useRouter();
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New To-Do</SheetTitle>
        </SheetHeader>

        <form onSubmit={onSubmit} className="space-y-6 p-4 pt-0" noValidate>
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
              placeholder="Enter title"
              autoComplete="off"
              disabled={busy || disabled}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              name="description"
              maxLength={8000}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              disabled={busy || disabled}
            />
          </div>

          <TaskAssigneeField
            id="task-assignee"
            value={assignedToUid}
            onValueChange={setAssignedToUid}
            disabled={busy || disabled}
          />

          <TaskDatePicker
            id="task-due"
            label="Due Date"
            date={dueDate}
            onDateChange={setDueDate}
            disabled={busy || disabled}
          />

          <TaskDatePicker
            id="task-reminder"
            label="Reminder Date"
            date={reminderDate}
            onDateChange={setReminderDate}
            disabled={busy || disabled}
          />

          <TaskStatusPriorityFields
            status={column}
            onStatusChange={setColumn}
            priority={priority}
            onPriorityChange={setPriority}
            disabled={busy || disabled}
            statusId="task-status"
            priorityId="task-priority"
          />

          <TaskCustomerSelect
            id="task-customer"
            options={customerOptions}
            value={effectiveCustomerId}
            onValueChange={setCustomerId}
            disabled={busy || disabled}
            lockedCustomerId={lockCustomer ? defaultCustomerId : undefined}
          />

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

          <Button type="submit" className="w-full" disabled={busy || disabled || !title.trim()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Add To-Do
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
