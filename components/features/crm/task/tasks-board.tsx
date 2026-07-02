"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EllipsisVertical,
  GripVertical,
  MessageSquare,
  Paperclip,
  PlusCircleIcon
} from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { KanbanProgressRing } from "@/components/shared/kanban-progress-ring";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import * as Kanban from "@/components/ui/kanban";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { taskPriorityBadgeDisplay } from "@/lib/crm/status-badges";
import { buildKanbanColumns, detectCrossColumnMove } from "@/lib/kanban/column-state";
import { coerceTaskPriority } from "@/lib/tasks/task-priority";
import {
  TASK_BOARD_COLUMNS,
  statusToBoardColumn,
  taskBoardColumnLabel,
  type TaskBoardColumnId
} from "@/lib/tasks/task-board-columns";
import { cn } from "@/lib/utils";
import { useTaskStatusMutation } from "@/hooks/use-task-status-mutation";
import { deleteTaskAction } from "@/server/actions/tasks-crm";
import type { TaskRecord } from "@/types/task";

function groupTasksByColumn(tasks: TaskRecord[]): Record<TaskBoardColumnId, TaskRecord[]> {
  return buildKanbanColumns(TASK_BOARD_COLUMNS, tasks, (t) => statusToBoardColumn(t.status)) as Record<
    TaskBoardColumnId,
    TaskRecord[]
  >;
}

function TaskKanbanCard({
  task,
  disabled,
  onEdit,
  onDelete
}: {
  task: TaskRecord;
  disabled?: boolean;
  onEdit: (task: TaskRecord) => void;
  onDelete: (task: TaskRecord) => void;
}) {
  const pct = Math.min(100, Math.max(0, task.progressPercent ?? 0));
  const attachments = task.attachmentCount ?? 0;
  const comments = task.commentCount ?? 0;
  const assignees = task.assigneeCount ?? 0;
  const avatarSlots = Math.min(3, Math.max(assignees, assignees > 0 ? 1 : 0));
  const avatarOverflow = assignees > 3 ? assignees - 3 : 0;
  const priorityBadge = taskPriorityBadgeDisplay(task.priority);
  const palette = ["bg-sky-400", "bg-emerald-400", "bg-orange-400"];

  return (
    <Kanban.Item value={task.id} asHandle asChild disabled={disabled}>
      <Card className="border-0">
        <CardHeader className="relative space-y-1 pb-2">
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onPointerDown={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Task options">
                  <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onSelect={() => onEdit(task)}>
                  Edit task
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onSelect={() => onDelete(task)}>
                  Delete task
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
          </div>
          <CardTitle className="pr-8 text-base font-semibold">{task.title}</CardTitle>
          {task.description ? (
            <CardDescription className="line-clamp-2">{task.description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <div className="flex -space-x-2 overflow-hidden">
              {assignees > 0
                ? Array.from({ length: avatarSlots }).map((_, i) => (
                    <Avatar key={i} className="border-background size-7 border-2">
                      <AvatarFallback
                        className={cn(
                          "text-[10px] font-semibold text-white",
                          palette[i % palette.length]
                        )}>
                        {String.fromCharCode(65 + (i % 26))}
                      </AvatarFallback>
                    </Avatar>
                  ))
                : null}
              {avatarOverflow > 0 ? (
                <Avatar className="border-background size-7 border-2">
                  <AvatarFallback className="bg-muted text-[10px]">+{avatarOverflow}</AvatarFallback>
                </Avatar>
              ) : null}
            </div>
            <KanbanProgressRing value={pct} />
          </div>
          <Separator />
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <Badge variant="outline">{priorityBadge.label}</Badge>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Paperclip className="h-4 w-4" aria-hidden />
                {attachments}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-4 w-4" aria-hidden />
                {comments}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Kanban.Item>
  );
}

export interface TasksBoardProps {
  tasks: TaskRecord[];
  onRequestAddToColumn?: (column: TaskBoardColumnId) => void;
  addDisabled?: boolean;
  onRequestEditTask?: (task: TaskRecord) => void;
}

export function TasksBoard({ tasks, onRequestAddToColumn, addDisabled, onRequestEditTask }: TasksBoardProps) {
  const router = useRouter();
  const { moveToColumn, pendingId } = useTaskStatusMutation();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<TaskRecord | null>(null);

  const serverColumns = React.useMemo(() => groupTasksByColumn(tasks), [tasks]);
  const [columns, setColumns] = React.useState(serverColumns);
  const dragPersistedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    setColumns(serverColumns);
  }, [serverColumns]);

  const handleValueChange = React.useCallback(
    (next: Record<TaskBoardColumnId, TaskRecord[]>) => {
      const moved = detectCrossColumnMove(columns, next, (t) => t.id);
      setColumns(next as Record<TaskBoardColumnId, TaskRecord[]>);
      if (moved && dragPersistedRef.current !== moved.id) {
        dragPersistedRef.current = moved.id;
        void moveToColumn(moved.id, moved.newColumn as TaskBoardColumnId);
      }
    },
    [columns, moveToColumn]
  );

  function handleDragStart() {
    dragPersistedRef.current = null;
  }

  function handleDragCancel() {
    dragPersistedRef.current = null;
  }

  function requestDelete(task: TaskRecord) {
    setDeleteTarget(task);
    setConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    const res = await deleteTaskAction(deleteTarget.id);
    setDeletingId(null);
    if (!res.ok) throw new Error(res.message);
    router.refresh();
  }

  return (
    <>
      <Kanban.Root
        value={columns}
        onValueChange={handleValueChange}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        getItemValue={(item) => item.id}>
        <Kanban.Board className="flex w-full gap-4 overflow-x-auto pb-4">
          {TASK_BOARD_COLUMNS.map((columnId) => {
            const columnTasks = columns[columnId] ?? [];
            return (
              <Kanban.Column key={columnId} value={columnId} className="w-[340px] min-w-[340px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{taskBoardColumnLabel(columnId)}</span>
                    <Badge variant="outline">{columnTasks.length}</Badge>
                  </div>
                  <div className="flex">
                    <Kanban.ColumnHandle asChild>
                      <Button variant="ghost" size="icon" aria-label={`Reorder ${taskBoardColumnLabel(columnId)} column`}>
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </Kanban.ColumnHandle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={addDisabled}
                          aria-label={`Add task to ${taskBoardColumnLabel(columnId)}`}
                          onClick={() => onRequestAddToColumn?.(columnId)}>
                          <PlusCircleIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add task</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                {columnTasks.length > 0 ? (
                  <div className="flex flex-col gap-2 p-0.5">
                    {columnTasks.map((task) => (
                      <TaskKanbanCard
                        key={task.id}
                        task={task}
                        disabled={pendingId === task.id || deletingId === task.id}
                        onEdit={(t) => onRequestEditTask?.(t)}
                        onDelete={requestDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col justify-center gap-4 pt-4">
                    <div className="text-muted-foreground text-sm">No task added here.</div>
                    <Button
                      variant="outline"
                      disabled={addDisabled}
                      onClick={() => onRequestAddToColumn?.(columnId)}>
                      Add task
                    </Button>
                  </div>
                )}
              </Kanban.Column>
            );
          })}
        </Kanban.Board>
        <Kanban.Overlay>
          <div className="bg-primary/10 size-full rounded-md" />
        </Kanban.Overlay>
      </Kanban.Root>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete task"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.title}" permanently? This cannot be undone.`
            : "Delete this task permanently? This cannot be undone."
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export { groupTasksByColumn };
