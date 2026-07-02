"use client";

import * as React from "react";
import Link from "next/link";
import { EllipsisVertical } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { taskColumnBadgeDisplay, taskPriorityBadgeDisplay } from "@/lib/crm/status-badges";
import {
  TASK_BOARD_COLUMNS,
  statusToBoardColumn,
  taskBoardColumnLabel,
  type TaskBoardColumnId
} from "@/lib/tasks/task-board-columns";
import { cn } from "@/lib/utils";
import { useTaskStatusMutation } from "@/hooks/use-task-status-mutation";
import type { TaskRecord } from "@/types/task";

export interface TasksListTableProps {
  tasks: TaskRecord[];
  onRequestEditTask?: (task: TaskRecord) => void;
}

export function TasksListTable({ tasks, onRequestEditTask }: TasksListTableProps) {
  const { moveToColumn, pendingId } = useTaskStatusMutation();

  const columns = React.useMemo<ColumnDef<TaskRecord>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Task" />,
        cell: ({ row }) => {
          const task = row.original;
          return (
            <div className="min-w-0">
              <div className="font-medium">{task.title}</div>
              {task.description ? (
                <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{task.description}</div>
              ) : null}
            </div>
          );
        }
      },
      {
        id: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
        cell: ({ row }) => {
          const d = taskPriorityBadgeDisplay(row.original.priority);
          return <StatusBadge label={d.label} variant={d.variant} />;
        },
        enableSorting: false
      },
      {
        id: "column",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Column" />,
        cell: ({ row }) => {
          const task = row.original;
          const rowDisabled = pendingId === task.id;

          return (
            <Select
              value={statusToBoardColumn(task.status)}
              disabled={rowDisabled}
              onValueChange={(value) => {
                const next = value as TaskBoardColumnId;
                const current = statusToBoardColumn(task.status);
                if (next !== current) void moveToColumn(task.id, next);
              }}>
              <SelectTrigger
                className={cn("h-8 w-[160px]", rowDisabled && "opacity-60")}
                aria-label={`Column for ${task.title}`}>
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
          );
        },
        enableSorting: false
      },
      {
        id: "statusBadge",
        header: "Status",
        cell: ({ row }) => {
          const d = taskColumnBadgeDisplay(row.original.status);
          return <StatusBadge label={d.label} variant={d.variant} />;
        },
        enableSorting: false,
        enableHiding: true
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {new Date(row.original.updatedAt).toLocaleString()}
          </span>
        )
      },
      {
        accessorKey: "customerId",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
        cell: ({ row }) => {
          const customerId = row.original.customerId;
          return customerId ? (
            <Link
              href={`/admin/customers/${customerId}`}
              className="font-mono text-xs text-primary underline-offset-4 hover:underline">
              {customerId.slice(0, 10)}…
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        }
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const task = row.original;
          const rowDisabled = pendingId === task.id;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={rowDisabled}
                  aria-label={`Actions for ${task.title}`}>
                  <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onSelect={() => onRequestEditTask?.(task)}>
                  Edit task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {task.customerId ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/customers/${task.customerId}`}>Open customer</Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem disabled>No linked customer</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false
      }
    ],
    [pendingId, moveToColumn, onRequestEditTask]
  );

  return (
    <DataTable
      columns={columns}
      data={tasks}
      initialPageSize={50}
      emptyMessage="No tasks yet. Add a task from the board view or the button above."
    />
  );
}
