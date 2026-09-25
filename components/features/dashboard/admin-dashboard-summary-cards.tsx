"use client";

import {
  CircleDollarSign,
  CreditCard,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import type { DashboardKpiCard } from "@/lib/dashboard/build-dashboard-view";
import { cn } from "@/lib/utils";

interface AdminDashboardSummaryCardsProps {
  revenue: DashboardKpiCard;
  payments: DashboardKpiCard;
  activeLeads: DashboardKpiCard;
  openTickets: DashboardKpiCard;
}

const KPI_ICONS: Record<string, LucideIcon> = {
  Revenue: CircleDollarSign,
  Payments: CreditCard,
  "Active Leads": Users,
  "Open Tickets": Ticket,
};

function SummaryCard({ kpi }: { kpi: DashboardKpiCard }) {
  const Icon = KPI_ICONS[kpi.title];
  const showDelta = typeof kpi.delta === "string" && kpi.delta.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm">
          {Icon ? (
            <Icon className="mr-3 inline size-7 rounded-md border p-1.5" aria-hidden />
          ) : null}
          {kpi.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col justify-between">
        <Typography variant="display-lg" className="mb-2">
          {kpi.value}
        </Typography>
        {showDelta ? (
          <div
            className={cn(
              "flex items-center text-sm",
              kpi.deltaNeutral
                ? "text-muted-foreground"
                : kpi.deltaPositive
                  ? "text-green-600"
                  : "text-red-600",
            )}
          >
            {kpi.deltaNeutral ? null : kpi.deltaPositive ? (
              <TrendingUp className="mr-1 size-4" aria-hidden />
            ) : (
              <TrendingDown className="mr-1 size-4" aria-hidden />
            )}
            <span className="sr-only">
              {kpi.deltaNeutral
                ? "No change "
                : kpi.deltaPositive
                  ? "Increased by "
                  : "Decreased by "}
            </span>
            {kpi.delta}
            <span className="text-muted-foreground ml-1">vs previous period</span>
          </div>
        ) : null}
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
      {cards.map((kpi) => (
        <SummaryCard key={kpi.title} kpi={kpi} />
      ))}
    </div>
  );
}
