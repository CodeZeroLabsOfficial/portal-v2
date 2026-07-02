"use client";

import * as React from "react";
import { CalendarRange } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type {
  AdminDashboardChartTabId,
  AdminDashboardChartTabPayload,
} from "@/lib/dashboard/chart-payload";
import { cn } from "@/lib/utils";

const chartConfig = {
  updates: {
    label: "Updates",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface AdminDashboardChartProps {
  tabs: AdminDashboardChartTabPayload[];
  chartRangeLabel: string;
  defaultTab?: AdminDashboardChartTabId;
}

export function AdminDashboardChart({
  tabs,
  chartRangeLabel,
  defaultTab = "subscriptions",
}: AdminDashboardChartProps) {
  const [selected, setSelected] = React.useState<AdminDashboardChartTabId>(defaultTab);
  const active = tabs.find((tab) => tab.id === selected) ?? tabs[0];

  const chartData = React.useMemo(
    () =>
      (active?.points ?? []).map((value, index) => ({
        label: active?.xLabels[index] ?? "",
        updates: value,
      })),
    [active],
  );

  return (
    <Card className="overflow-hidden py-0">
      <div
        className="grid grid-cols-2 divide-x sm:grid-cols-4"
        role="tablist"
        aria-label="Dashboard activity metrics"
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === selected;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              title={tab.hint}
              aria-selected={isSelected}
              className={cn(
                "flex w-full flex-col items-center px-3 py-4 text-center transition-colors md:px-5",
                isSelected
                  ? "bg-primary/5 text-primary"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
              onClick={() => setSelected(tab.id)}
            >
              <span
                className={cn(
                  "text-xl font-semibold tabular-nums tracking-tight sm:text-2xl",
                  isSelected ? "text-primary" : "text-muted-foreground",
                )}
              >
                {tab.valueDisplay}
              </span>
              <span
                className={cn(
                  "mt-1 text-xs font-medium",
                  isSelected ? "text-primary" : "text-foreground/80",
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <CardContent className="space-y-4 border-t px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 text-muted-foreground"
            type="button"
            tabIndex={-1}
          >
            <CalendarRange className="size-4 shrink-0" aria-hidden />
            {chartRangeLabel}
          </Button>
          {active?.hint ? (
            <p className="text-muted-foreground max-w-md text-right text-xs">{active.hint}</p>
          ) : null}
        </div>

        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
          <AreaChart data={chartData} accessibilityLayer margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="adminDashboardFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-updates)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-updates)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/60" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              className="text-muted-foreground text-[11px]"
            />
            <ChartTooltip
              cursor={{ stroke: "var(--color-updates)", strokeDasharray: "4 4" }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelKey="label"
                  nameKey="updates"
                  formatter={(value) => [
                    `${value} ${Number(value) === 1 ? "update" : "updates"}`,
                    active?.label ?? "Activity",
                  ]}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="updates"
              stroke="var(--color-updates)"
              strokeWidth={2}
              fill="url(#adminDashboardFill)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-updates)", stroke: "var(--background)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
