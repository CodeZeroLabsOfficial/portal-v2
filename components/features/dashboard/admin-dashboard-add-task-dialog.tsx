"use client";

import * as React from "react";
import { Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { FormServerError } from "@/components/shared/form-server-error";
import { TaskAssigneeField } from "@/components/shared/task-assignee-field";
import {
  TaskCustomerSelect,
  type TaskCustomerOption,
} from "@/components/shared/task-customer-select";
import { TaskDatePicker } from "@/components/shared/task-date-picker";
import { TaskStatusPriorityFields } from "@/components/shared/task-status-priority-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type TaskBoardColumnId } from "@/lib/tasks/task-board-columns";
import { DEFAULT_TASK_PRIORITY, type TaskPriorityValue } from "@/lib/tasks/task-priority";
import { createTaskAction } from "@/server/actions/tasks-crm";

interface AdminDashboardAddTaskDialogProps {
  customerOptions: TaskCustomerOption[];
}

export function AdminDashboardAddTaskDialog({
  customerOptions,
}: AdminDashboardAddTaskDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [assignedToUid, setAssignedToUid] = React.useState("");
  const [customerId, setCustomerId] = React.useState("");
  const [dueDate, setDueDate] = React.useState<Date | undefined>();
  const [reminderDate, setReminderDate] = React.useState<Date | undefined>();
  const [column, setColumn] = React.useState<TaskBoardColumnId>("todo");
  const [priority, setPriority] = React.useState<TaskPriorityValue>(DEFAULT_TASK_PRIORITY);
  const [pending, setPending] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) return;
    setTitle("");
    setDescription("");
    setAssignedToUid("");
    setCustomerId("");
    setDueDate(undefined);
    setReminderDate(undefined);
    setColumn("todo");
    setPriority(DEFAULT_TASK_PRIORITY);
    setServerError(null);
  }, [open]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setServerError(null);
    setPending(true);

    const res = await createTaskAction({
      title,
      description: description.trim() || undefined,
      column,
      priority,
      progressPercent: 0,
      assignedToUid: assignedToUid || undefined,
      customerId: customerId.trim() || undefined,
      dueAt: dueDate ? dueDate.getTime() : undefined,
      reminderAt: reminderDate ? reminderDate.getTime() : undefined,
    });
    setPending(false);
    if (!res.ok) {
      setServerError(res.message);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          <PlusCircle />
          Set Reminder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <FormServerError message={serverError} />

          <div className="space-y-1.5">
            <Label htmlFor="dashboard-task-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dashboard-task-title"
              name="title"
              required
              maxLength={500}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter title"
              autoComplete="off"
              disabled={pending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dashboard-task-description">Description</Label>
            <Textarea
              id="dashboard-task-description"
              name="description"
              maxLength={8000}
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Enter description"
              disabled={pending}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TaskCustomerSelect
              id="dashboard-task-customer"
              options={customerOptions}
              value={customerId}
              onValueChange={setCustomerId}
              disabled={pending}
            />
            <TaskAssigneeField
              id="dashboard-task-assignee"
              value={assignedToUid}
              onValueChange={setAssignedToUid}
              disabled={pending}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TaskDatePicker
              id="dashboard-task-due"
              label="Due Date"
              date={dueDate}
              onDateChange={setDueDate}
              disabled={pending}
            />
            <TaskDatePicker
              id="dashboard-task-reminder"
              label="Reminder Date"
              date={reminderDate}
              onDateChange={setReminderDate}
              disabled={pending}
            />
          </div>

          <TaskStatusPriorityFields
            status={column}
            onStatusChange={setColumn}
            priority={priority}
            onPriorityChange={setPriority}
            disabled={pending}
            statusId="dashboard-task-status"
            priorityId="dashboard-task-priority"
          />

          <DialogFooter>
            <Button type="submit" disabled={pending || !title.trim()}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Add Reminder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
