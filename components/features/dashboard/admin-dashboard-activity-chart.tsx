"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

const chartConfig = {
  activity: {
    label: "Activity",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface AdminDashboardActivityChartProps {
  tabs: AdminDashboardChartTabPayload[];
  defaultTab?: AdminDashboardChartTabId;
}

export function AdminDashboardActivityChart({
  tabs,
  defaultTab = "subscriptions",
}: AdminDashboardActivityChartProps) {
  const [activeTab, setActiveTab] = React.useState<AdminDashboardChartTabId>(defaultTab);
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const fillGradientId = React.useId().replace(/:/g, "");

  const chartData = React.useMemo(
    () =>
      (active?.points ?? []).map((value, index) => ({
        label: active?.xLabels[index] ?? "",
        activity: value,
      })),
    [active],
  );

  return (
    <Card className="@container/card overflow-hidden py-0">
      <div
        className="grid grid-cols-2 divide-x border-b sm:grid-cols-4"
        role="tablist"
        aria-label="Dashboard activity metrics"
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              title={tab.hint}
              aria-selected={isSelected}
              data-active={isSelected}
              className="data-[active=true]:bg-muted relative flex flex-col justify-center gap-1 px-4 py-3 text-left sm:px-6 sm:py-4"
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-muted-foreground text-xs">{tab.label}</span>
              <span className="font-display text-lg leading-none tabular-nums sm:text-2xl">
                {tab.valueDisplay}
              </span>
            </button>
          );
        })}
      </div>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full lg:h-[250px]">
          <AreaChart
            data={chartData}
            accessibilityLayer
            margin={{ top: 8, left: 0, right: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-activity)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-activity)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <YAxis
              hide
              domain={[0, (max: number) => Math.max(Math.ceil(max * 1.15), 1)]}
              allowDecimals={false}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  nameKey="activity"
                  formatter={(value) => [
                    `${value} ${Number(value) === 1 ? "update" : "updates"}`,
                    active?.label ?? "Activity",
                  ]}
                />
              }
            />
            <Area
              dataKey="activity"
              type="monotone"
              baseValue={0}
              fill={`url(#${fillGradientId})`}
              stroke="var(--color-activity)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
