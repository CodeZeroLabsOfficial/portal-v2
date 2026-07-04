"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  TASK_BOARD_COLUMNS,
  TASK_STATUS_DOT_CLASSES,
  taskBoardColumnLabel,
  type TaskBoardColumnId
} from "@/lib/tasks/task-board-columns";
import {
  TASK_PRIORITY_DOT_CLASSES,
  TASK_PRIORITY_VALUES,
  taskPriorityLabel,
  type TaskPriorityValue
} from "@/lib/tasks/task-priority";
import { cn } from "@/lib/utils";

export interface TaskStatusPriorityFieldsProps {
  status: TaskBoardColumnId;
  onStatusChange: (column: TaskBoardColumnId) => void;
  priority: TaskPriorityValue;
  onPriorityChange: (priority: TaskPriorityValue) => void;
  disabled?: boolean;
  statusId?: string;
  priorityId?: string;
}

/** Status + priority row with colored dots (UI kit todo add/edit sheet). */
export function TaskStatusPriorityFields({
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  disabled,
  statusId = "task-status",
  priorityId = "task-priority"
}: TaskStatusPriorityFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor={statusId}>Status</Label>
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as TaskBoardColumnId)}
          disabled={disabled}>
          <SelectTrigger id={statusId} className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {TASK_BOARD_COLUMNS.map((column) => (
              <SelectItem key={column} value={column}>
                <span className="flex items-center gap-2">
                  <span
                    className={cn("size-2 shrink-0 rounded-full", TASK_STATUS_DOT_CLASSES[column])}
                  />
                  {taskBoardColumnLabel(column)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={priorityId}>Priority</Label>
        <Select
          value={priority}
          onValueChange={(value) => onPriorityChange(value as TaskPriorityValue)}
          disabled={disabled}>
          <SelectTrigger id={priorityId} className="w-full capitalize">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {TASK_PRIORITY_VALUES.map((p) => (
              <SelectItem key={p} value={p} className="capitalize">
                <span className="flex items-center gap-2">
                  <span
                    className={cn("size-2 shrink-0 rounded-full", TASK_PRIORITY_DOT_CLASSES[p])}
                  />
                  {taskPriorityLabel(p)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
