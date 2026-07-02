"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from "@dnd-kit/core";
import { Clock, EllipsisVertical, FileText, MessageCircle, MoreHorizontal, Plus } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  TASK_BOARD_COLUMNS,
  statusToBoardColumn,
  taskBoardColumnLabel,
  type TaskBoardColumnId,
  isTaskBoardColumnId
} from "@/lib/tasks/task-board-columns";
import { taskColumnBadgeDisplay, taskPriorityBadgeDisplay } from "@/lib/crm/status-badges";
import { cn } from "@/lib/utils";
import { useTaskStatusMutation } from "@/hooks/use-task-status-mutation";
import { deleteTaskAction } from "@/server/actions/tasks-crm";
import type { TaskRecord } from "@/types/task";

function formatBoardDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function StageColumn({
  stage,
  children,
  count,
  onAdd,
  addDisabled
}: {
  stage: TaskBoardColumnId;
  children: React.ReactNode;
  count: number;
  onAdd: () => void;
  addDisabled?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[420px] min-w-[260px] flex-1 flex-col rounded-xl border bg-muted/20",
        isOver ? "border-primary/60 ring-1 ring-primary/30" : "border-border/70"
      )}>
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
        <span className="text-[13px] font-semibold text-foreground">{taskBoardColumnLabel(stage)}</span>
        <div className="flex items-center gap-1">
          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium tabular-nums text-primary-foreground">
            {count}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                aria-label={`${taskBoardColumnLabel(stage)} column menu`}>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>Column options (soon)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">{children}</div>
      <div className="p-2 pt-0">
        <Button
          type="button"
          variant="outline"
          className="w-full gap-1.5 text-[13px] font-medium"
          disabled={addDisabled}
          onClick={onAdd}
          title={addDisabled ? "Cannot add tasks until your account has an organization id." : undefined}>
          <Plus className="h-4 w-4" aria-hidden />
          Add task
        </Button>
      </div>
    </div>
  );
}

function TaskCard({
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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined;

  const pct = Math.min(100, Math.max(0, task.progressPercent ?? 0));
  const showStart = typeof task.startAt === "number";
  const showDue = !showStart && typeof task.dueAt === "number";
  const attachments = task.attachmentCount ?? 0;
  const comments = task.commentCount ?? 0;
  const assignees = task.assigneeCount ?? 0;
  const avatarSlots = Math.min(3, Math.max(assignees, assignees > 0 ? 1 : 0));
  const avatarOverflow = assignees > 3 ? assignees - 3 : 0;
  const priorityBadge = taskPriorityBadgeDisplay(task.priority);
  const columnBadge = taskColumnBadgeDisplay(task.status);

  const palette = ["bg-sky-400", "bg-emerald-400", "bg-orange-400"];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-border/70 bg-card shadow-sm transition-colors",
        isDragging && "opacity-40",
        disabled && "pointer-events-none opacity-60"
      )}>
      <div {...listeners} {...attributes} className="cursor-grab p-3 active:cursor-grabbing">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge label={priorityBadge.label} variant={priorityBadge.variant} />
            {task.category ? (
              <StatusBadge label={task.category} variant="info" className="max-w-[8rem] truncate" />
            ) : (
              <StatusBadge label={columnBadge.label} variant={columnBadge.variant} />
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onPointerDown={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="-mr-1 -mt-1 h-7 w-7 shrink-0" aria-label="Task options">
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
        <p className="mt-2 text-[13px] font-semibold leading-snug text-foreground">{task.title}</p>
        {task.description ? (
          <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">{task.description}</p>
        ) : null}

        {showStart || showDue ? (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            <span>
              {showStart ? `Start: ${formatBoardDate(task.startAt!)}` : null}
              {showDue ? `Due: ${formatBoardDate(task.dueAt!)}` : null}
            </span>
          </div>
        ) : null}

        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Progress</span>
            <span className="tabular-nums text-foreground">{String(pct).padStart(2, "0")}%</span>
          </div>
          <Progress value={pct} className="h-2" aria-label={`${pct}% complete`} />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex -space-x-2">
            {assignees > 0
              ? Array.from({ length: avatarSlots }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-card text-[10px] font-semibold text-white shadow-sm ring-2 ring-background",
                      palette[i % palette.length]!
                    )}
                    aria-hidden>
                    {String.fromCharCode(65 + (i % 26))}
                  </span>
                ))
              : null}
            {avatarOverflow > 0 ? (
              <span className="inline-flex h-7 min-w-8 items-center justify-center rounded-full border-2 border-card bg-muted px-1 text-[10px] font-medium text-muted-foreground ring-2 ring-background">
                +{avatarOverflow}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3 text-[11px] tabular-nums text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              {attachments}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              {comments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface TasksBoardProps {
  tasks: TaskRecord[];
  /** Opens create flow with the chosen column as default. */
  onRequestAddToColumn?: (column: TaskBoardColumnId) => void;
  /** When true, column “Add task” buttons stay disabled (e.g. missing organization). */
  addDisabled?: boolean;
  /** Opens edit dialog for the task (card ⋮ menu). */
  onRequestEditTask?: (task: TaskRecord) => void;
}

export function TasksBoard({ tasks, onRequestAddToColumn, addDisabled, onRequestEditTask }: TasksBoardProps) {
  const router = useRouter();
  const { moveToColumn, pendingId } = useTaskStatusMutation();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<TaskRecord | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    })
  );

  const byColumn = React.useMemo(() => {
    const map = new Map<TaskBoardColumnId, TaskRecord[]>();
    for (const c of TASK_BOARD_COLUMNS) {
      map.set(c, []);
    }
    for (const t of tasks) {
      const col = statusToBoardColumn(t.status);
      const list = map.get(col);
      if (list) list.push(t);
      else map.get("todo")!.push(t);
    }
    return map;
  }, [tasks]);

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : undefined;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const tid = String(event.active.id);
    setActiveId(null);
    const overId = event.over?.id;
    if (!overId) return;
    const task = tasks.find((t) => t.id === tid);
    if (!task) return;
    const next = String(overId);
    if (!isTaskBoardColumnId(next)) return;
    const current = statusToBoardColumn(task.status);
    if (next === current) return;
    void moveToColumn(tid, next);
  }

  function handleDragCancel() {
    setActiveId(null);
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
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {TASK_BOARD_COLUMNS.map((stage) => {
            const list = byColumn.get(stage) ?? [];
            return (
              <StageColumn
                key={stage}
                stage={stage}
                count={list.length}
                onAdd={() => onRequestAddToColumn?.(stage)}
                addDisabled={Boolean(addDisabled)}>
                {list.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    disabled={pendingId === task.id || deletingId === task.id}
                    onEdit={(t) => onRequestEditTask?.(t)}
                    onDelete={requestDelete}
                  />
                ))}
              </StageColumn>
            );
          })}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="pointer-events-none min-w-[240px] max-w-[280px] rounded-xl border border-border bg-card p-3 shadow-lg">
              <p className="text-[13px] font-semibold text-foreground">{activeTask.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
