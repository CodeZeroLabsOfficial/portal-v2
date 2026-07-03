import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isTaskOpenStatus } from "@/lib/dashboard/metrics";
import { cn } from "@/lib/utils";
import type { TaskRecord } from "@/types/task";

interface AdminDashboardRemindersProps {
  tasks: TaskRecord[];
}

function taskUrgency(task: TaskRecord, nowMs: number): "high" | "medium" | "low" {
  const due = task.dueAt;
  if (due === undefined || !Number.isFinite(due)) return "low";
  if (due < nowMs) return "high";
  if (due - nowMs <= 2 * 86400000) return "medium";
  return "low";
}

function formatTaskDue(dueAt: number | undefined): string {
  if (dueAt === undefined || !Number.isFinite(dueAt)) return "No due date";
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dueAt));
}

export function AdminDashboardReminders({ tasks }: AdminDashboardRemindersProps) {
  const nowMs = Date.now();
  const reminders = tasks
    .filter((task) => isTaskOpenStatus(task.status) && task.dueAt !== undefined)
    .sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0))
    .slice(0, 3);

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Reminders</CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">No upcoming task reminders</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {reminders.map((task) => {
              const level = taskUrgency(task, nowMs);
              const isCompleted = false;
              return (
                <Card key={task.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base font-semibold capitalize">
                      <span
                        className={cn("me-2 inline-block size-2 rounded-full", {
                          "bg-gray-400": level === "low",
                          "bg-orange-400": level === "medium",
                          "bg-red-600": level === "high",
                        })}
                        aria-hidden
                      />
                      {level}
                      {isCompleted ? (
                        <CircleCheck className="ms-auto me-2 size-4 text-green-600" aria-hidden />
                      ) : (
                        <CircleCheck className="text-muted-foreground ms-auto me-2 size-4" aria-hidden />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-muted-foreground text-sm">{formatTaskDue(task.dueAt)}</div>
                    <div className="line-clamp-2 text-sm">{task.title}</div>
                    <Badge variant="outline">{task.status}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        <div className="mt-4 text-end">
          <Button variant="link" className="text-muted-foreground hover:text-primary" asChild>
            <Link href="/admin/tasks">
              View all tasks <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
