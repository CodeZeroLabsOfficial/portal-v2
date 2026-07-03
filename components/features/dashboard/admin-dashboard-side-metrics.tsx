import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminDashboardSideMetricsProps {
  openTicketTotal: number;
  ticketBuckets: { critical: number; high: number; medium: number };
  taskDue: { overdue: number; dueThisWeek: number };
}

export function AdminDashboardSideMetrics({
  openTicketTotal,
  ticketBuckets,
  taskDue,
}: AdminDashboardSideMetricsProps) {
  const taskHeadline = taskDue.overdue + taskDue.dueThisWeek;

  return (
    <Card>
      <CardHeader>
        <CardDescription>Operations</CardDescription>
        <CardTitle className="font-display text-2xl tabular-nums lg:text-3xl">
          {openTicketTotal + taskHeadline}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-sm font-bold">Highlights</p>
        <div className="divide-y *:py-3">
          <div className="flex justify-between gap-3 text-sm">
            <span>Open tickets</span>
            <span className="flex items-center gap-1 tabular-nums">
              {ticketBuckets.critical > 0 ? (
                <ArrowUpRight className="size-4 text-red-600" aria-hidden />
              ) : (
                <ArrowDownLeft className="text-muted-foreground size-4" aria-hidden />
              )}
              {openTicketTotal}
            </span>
          </div>
          <div className="flex justify-between gap-3 text-sm">
            <span>Critical urgency</span>
            <span className="tabular-nums">{ticketBuckets.critical}</span>
          </div>
          <div className="flex justify-between gap-3 text-sm">
            <span>Tasks due this week</span>
            <span className="flex items-center gap-1 tabular-nums">
              {taskDue.overdue > 0 ? (
                <ArrowUpRight className="size-4 text-amber-600" aria-hidden />
              ) : null}
              {taskDue.dueThisWeek}
            </span>
          </div>
          <div className="flex justify-between gap-3 text-sm">
            <span>Overdue tasks</span>
            <span className="tabular-nums">{taskDue.overdue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
