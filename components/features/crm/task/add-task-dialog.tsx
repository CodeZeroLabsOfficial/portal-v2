"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { FormServerError } from "@/components/shared/form-server-error";
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
import { createTaskAction, listTaskAssigneeOptionsAction } from "@/server/actions/tasks-crm";

export interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When the user opens from a column footer, that column is pre-selected. */
  defaultColumn: TaskBoardColumnId;
  disabled?: boolean;
  disabledReason?: string;
}

export function AddTaskDialog({
  open,
  onOpenChange,
  defaultColumn,
  disabled,
  disabledReason
}: AddTaskDialogProps) {
  const router = useRouter();
  const [column, setColumn] = React.useState<TaskBoardColumnId>(defaultColumn);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriorityValue>(DEFAULT_TASK_PRIORITY);
  const [progressPercent, setProgressPercent] = React.useState(0);
  const [assignedToUid, setAssignedToUid] = React.useState("");
  const [assigneeOptions, setAssigneeOptions] = React.useState<
    Array<{ uid: string; displayName: string; email: string }>
  >([]);
  const [loadingAssignees, setLoadingAssignees] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setColumn(defaultColumn);
    }
  }, [open, defaultColumn]);

  React.useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setPriority(DEFAULT_TASK_PRIORITY);
      setProgressPercent(0);
      setAssignedToUid("");
      setServerError(null);
    }
  }, [open]);

  React.useEffect(() => {
    let cancelled = false;
    if (!open || disabled) return;
    setLoadingAssignees(true);
    void listTaskAssigneeOptionsAction().then((res) => {
      if (cancelled) return;
      setLoadingAssignees(false);
      if (!res.ok) {
        setServerError(res.message);
        setAssigneeOptions([]);
        return;
      }
      setAssigneeOptions(res.options);
      setAssignedToUid((current) => {
        if (current && res.options.some((o) => o.uid === current)) return current;
        return res.options[0]?.uid ?? "";
      });
    });
    return () => {
      cancelled = true;
    };
  }, [open, disabled]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setServerError(null);
    setPending(true);
    const res = await createTaskAction({
      title,
      description: description.trim() || undefined,
      column,
      priority,
      progressPercent,
      assignedToUid: assignedToUid || undefined
    });
    setPending(false);
    if (!res.ok) {
      setServerError(res.message);
      return;
    }
    setTitle("");
    setDescription("");
    onOpenChange(false);
    router.refresh();
  }

  const busy = pending;

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
              <Label htmlFor="task-column">Column</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="task-assignee">Assign to</Label>
              <Select
                value={assignedToUid}
                onValueChange={setAssignedToUid}
                disabled={busy || disabled || loadingAssignees || assigneeOptions.length === 0}>
                <SelectTrigger id="task-assignee" className="w-full">
                  <SelectValue
                    placeholder={
                      loadingAssignees
                        ? "Loading users…"
                        : assigneeOptions.length === 0
                          ? "No assignable users"
                          : "Select assignee"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {assigneeOptions.map((opt) => (
                    <SelectItem key={opt.uid} value={opt.uid}>
                      {opt.displayName}
                      {opt.email ? ` (${opt.email})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button
              type="submit"
              disabled={busy || disabled || !title.trim() || (!loadingAssignees && assigneeOptions.length === 0)}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
