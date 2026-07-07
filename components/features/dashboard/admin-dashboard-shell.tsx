"use client";

import * as React from "react";
import { FolderUp } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { AdminDashboardAchievement } from "@/components/features/dashboard/admin-dashboard-achievement";
import { AdminDashboardActivityChart } from "@/components/features/dashboard/admin-dashboard-activity-chart";
import { AdminDashboardRecentTransactions } from "@/components/features/dashboard/admin-dashboard-recent-transactions";
import { AdminDashboardReminders } from "@/components/features/dashboard/admin-dashboard-reminders";
import { AdminDashboardSalesPlaceholder } from "@/components/features/dashboard/admin-dashboard-sales-placeholder";
import { AdminDashboardSideMetrics } from "@/components/features/dashboard/admin-dashboard-side-metrics";
import { AdminDashboardStatusChart } from "@/components/features/dashboard/admin-dashboard-status-chart";
import { AdminDashboardSummaryCards } from "@/components/features/dashboard/admin-dashboard-summary-cards";
import CalendarDateRangePicker from "@/components/custom-date-range-picker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildDashboardViewModel,
  resolveDashboardEarliestMs,
} from "@/lib/dashboard/build-dashboard-view";
import {
  defaultDashboardDateRange,
  resolveDashboardRange,
} from "@/lib/dashboard/range";
import type { AdminPortalData } from "@/server/firestore/portal-data";

function firstName(displayName: string, fallback: string): string {
  const name = displayName.trim();
  if (name) {
    return name.split(/\s+/)[0] ?? name;
  }
  const email = fallback.trim();
  if (email.includes("@")) {
    return email.split("@")[0] ?? "there";
  }
  return email || "there";
}

function formatWelcomeDate(d: Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

interface AdminDashboardShellProps {
  data: AdminPortalData;
  displayName: string;
  userLabel: string;
}

export function AdminDashboardShell({ data, displayName, userLabel }: AdminDashboardShellProps) {
  const name = firstName(displayName, userLabel);
  const today = formatWelcomeDate(new Date());
  const earliestMs = React.useMemo(() => resolveDashboardEarliestMs(data), [data]);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(defaultDashboardDateRange);

  const resolvedRange = React.useMemo(
    () => resolveDashboardRange(dateRange, earliestMs),
    [dateRange, earliestMs],
  );

  const view = React.useMemo(
    () => buildDashboardViewModel(data, resolvedRange),
    [data, resolvedRange],
  );

  return (
    <>
      <div className="mb-4 flex flex-row items-center justify-between space-y-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {name}!</h1>
          <p className="text-muted-foreground text-sm">Here are your stats for {today}</p>
        </div>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker value={dateRange} onChange={setDateRange} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FolderUp />
                <span className="hidden lg:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>Excel</DropdownMenuItem>
              <DropdownMenuItem disabled>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="z-10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="activities" disabled>
            Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AdminDashboardSummaryCards {...view.kpis} />

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AdminDashboardActivityChart tabs={view.chartTabs} />
            </div>
            <AdminDashboardSideMetrics
              openTicketTotal={view.openTicketTotal}
              ticketBuckets={view.ticketBuckets}
              taskDue={view.taskDue}
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
            <AdminDashboardReminders tasks={data.tasks} />
            <AdminDashboardAchievement invoices={data.invoices} />
            <AdminDashboardStatusChart proposals={data.proposals} />
          </div>

          <AdminDashboardRecentTransactions payments={data.payments} />
        </TabsContent>

        <TabsContent value="sales">
          <AdminDashboardSalesPlaceholder />
        </TabsContent>

        <TabsContent value="activities">...</TabsContent>
      </Tabs>
    </>
  );
}
