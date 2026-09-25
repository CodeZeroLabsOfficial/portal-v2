"use client";

import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";

import { AdminDashboardAddTaskDialog } from "@/components/features/dashboard/admin-dashboard-add-task-dialog";
import type { TaskCustomerOption } from "@/components/shared/task-customer-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isTaskOpenStatus } from "@/lib/dashboard/metrics";
import { statusToBoardColumn } from "@/lib/tasks/task-board-columns";
import { coerceTaskPriority, type TaskPriorityValue } from "@/lib/tasks/task-priority";
import { cn } from "@/lib/utils";
import type { TaskRecord } from "@/types/task";

const REMINDER_PRIORITY_DOT: Record<TaskPriorityValue, string> = {
  low: "bg-gray-400",
  medium: "bg-orange-400",
  high: "bg-red-600",
};

const MS_PER_DAY = 86400000;

interface AdminDashboardRemindersProps {
  tasks: TaskRecord[];
  customerOptions: TaskCustomerOption[];
}

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function formatTaskDue(dueAt: number, now: Date): string {
  const due = new Date(dueAt);
  const time = new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(due);
  const dueDay = startOfLocalDay(due);
  const today = startOfLocalDay(now);
  if (dueDay === today) return `Today, ${time}`;
  if (dueDay === today + MS_PER_DAY) return `Tomorrow, ${time}`;
  const date = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
  }).format(due);
  return `${date}, ${time}`;
}

export function AdminDashboardReminders({
  tasks,
  customerOptions,
}: AdminDashboardRemindersProps) {
  const now = new Date();
  const openWithDueDate = tasks
    .filter((task) => isTaskOpenStatus(task.status) && task.dueAt !== undefined)
    .sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0));
  const reminders = openWithDueDate.slice(0, 3);
  const remaining = openWithDueDate.length - reminders.length;

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Reminder</CardTitle>
        <CardAction>
          <AdminDashboardAddTaskDialog customerOptions={customerOptions} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">No upcoming task reminders</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {reminders.map((task) => {
              const level = coerceTaskPriority(task.priority);
              const isCompleted = statusToBoardColumn(task.status) === "done";
              const badge = task.category?.trim() || task.status;
              return (
                <div key={task.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center text-sm font-semibold capitalize">
                    <span
                      className={cn("me-2 size-2 rounded-full", REMINDER_PRIORITY_DOT[level])}
                      aria-hidden
                    />
                    {level}
                    <CircleCheck
                      className={cn(
                        "ms-auto size-4",
                        isCompleted ? "text-green-600" : "text-gray-400",
                      )}
                      aria-hidden
                    />
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {formatTaskDue(task.dueAt ?? 0, now)}
                  </div>
                  <div className="text-sm">{task.title}</div>
                  <Badge variant="outline">{badge}</Badge>
                </div>
              );
            })}
          </div>
        )}
        {remaining > 0 ? (
          <div className="mt-4 text-end">
            <Button variant="link" className="text-muted-foreground hover:text-primary" asChild>
              <Link href="/admin/tasks">
                Show the other {remaining} reminder{remaining === 1 ? "" : "s"}{" "}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
