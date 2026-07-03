"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardKpiCard } from "@/lib/dashboard/build-dashboard-view";
import { cn } from "@/lib/utils";

interface AdminDashboardSummaryCardsProps {
  revenue: DashboardKpiCard;
  payments: DashboardKpiCard;
  activeLeads: DashboardKpiCard;
  openTickets: DashboardKpiCard;
}

function SummaryCard({ kpi }: { kpi: DashboardKpiCard }) {
  const showDelta = typeof kpi.delta === "string" && kpi.delta.length > 0;

  return (
    <Card className="w-full gap-0 p-6 py-4">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground text-sm font-medium">{kpi.title}</dt>
          {showDelta ? (
            <Badge
              variant="outline"
              className={cn(
                "inline-flex shrink-0 items-center px-1.5 py-0.5 ps-2.5 text-xs font-medium",
                kpi.deltaNeutral
                  ? "text-muted-foreground"
                  : kpi.deltaPositive
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
              )}
            >
              {!kpi.deltaNeutral ? (
                kpi.deltaPositive ? (
                  <TrendingUp
                    className="mr-0.5 -ml-1 size-5 shrink-0 self-center text-green-500"
                    aria-hidden
                  />
                ) : (
                  <TrendingDown
                    className="mr-0.5 -ml-1 size-5 shrink-0 self-center text-red-500"
                    aria-hidden
                  />
                )
              ) : null}
              <span className="sr-only">
                {kpi.deltaNeutral
                  ? "No change"
                  : kpi.deltaPositive
                    ? "Increased by "
                    : "Decreased by "}
              </span>
              {kpi.delta}
            </Badge>
          ) : null}
        </div>
        <dd className="text-foreground mt-2 text-3xl font-semibold tabular-nums">{kpi.value}</dd>
      </CardContent>
    </Card>
  );
}

export function AdminDashboardSummaryCards({
  revenue,
  payments,
  activeLeads,
  openTickets,
}: AdminDashboardSummaryCardsProps) {
  const cards: DashboardKpiCard[] = [revenue, payments, activeLeads, openTickets];

  return (
    <div className="*:data-[slot=card]:from-primary/10 grid gap-4 *:data-[slot=card]:bg-gradient-to-t md:grid-cols-2 lg:grid-cols-4">
      {cards.map((kpi) => (
        <SummaryCard key={kpi.title} kpi={kpi} />
      ))}
    </div>
  );
}
