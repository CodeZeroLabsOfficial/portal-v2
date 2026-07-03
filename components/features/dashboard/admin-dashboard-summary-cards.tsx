"use client";

import { Award, DollarSign, LifeBuoy, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardKpiCard } from "@/lib/dashboard/build-dashboard-view";
import { cn } from "@/lib/utils";

interface AdminDashboardSummaryCardsProps {
  revenue: DashboardKpiCard;
  payments: DashboardKpiCard;
  activeLeads: DashboardKpiCard;
  openTickets: DashboardKpiCard;
}

interface SummaryCardConfig {
  kpi: DashboardKpiCard;
  icon: LucideIcon;
}

function SummaryCard({ kpi, icon: Icon }: SummaryCardConfig) {
  const showDelta = typeof kpi.delta === "string" && kpi.delta.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{kpi.title}</CardTitle>
        <CardDescription>
          {showDelta ? (
            <>
              <span
                className={cn(
                  kpi.deltaNeutral
                    ? "text-muted-foreground"
                    : kpi.deltaPositive
                      ? "text-green-600"
                      : "text-red-600",
                )}
              >
                {kpi.delta}{" "}
              </span>
              from previous period
            </>
          ) : (
            kpi.footer
          )}
        </CardDescription>
        <CardAction>
          <Icon className="text-muted-foreground/50 size-4 lg:size-6" aria-hidden />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="font-display text-2xl tabular-nums lg:text-3xl">{kpi.value}</div>
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
  const cards: SummaryCardConfig[] = [
    { kpi: revenue, icon: DollarSign },
    { kpi: payments, icon: Wallet },
    { kpi: activeLeads, icon: Award },
    { kpi: openTickets, icon: LifeBuoy },
  ];

  return (
    <div className="*:data-[slot=card]:from-primary/10 grid gap-4 *:data-[slot=card]:bg-gradient-to-t md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <SummaryCard key={card.kpi.title} {...card} />
      ))}
    </div>
  );
}
