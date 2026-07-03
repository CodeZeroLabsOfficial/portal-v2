"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface AdminDashboardActivityChartProps {
  tabs: AdminDashboardChartTabPayload[];
  rangeLabel: string;
  defaultTab?: AdminDashboardChartTabId;
}

export function AdminDashboardActivityChart({
  tabs,
  rangeLabel,
  defaultTab = "subscriptions",
}: AdminDashboardActivityChartProps) {
  const [activeTab, setActiveTab] = React.useState<AdminDashboardChartTabId>(defaultTab);
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  const chartData = React.useMemo(
    () =>
      (active?.points ?? []).map((value, index) => ({
        label: active?.xLabels[index] ?? "",
        activity: value,
      })),
    [active],
  );

  const seriesTotal = React.useMemo(
    () => (active?.points ?? []).reduce((sum, value) => sum + value, 0),
    [active],
  );

  return (
    <Card className="@container/card relative h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>{rangeLabel}</CardDescription>
        <CardAction className="col-start-auto row-start-auto justify-self-start md:col-start-2 md:row-start-1 md:justify-self-end">
          <div
            className="end-0 top-0 flex max-w-full divide-x overflow-x-auto rounded-md border-s border-e border-t border-b md:absolute md:rounded-none md:rounded-bl-md md:border-e-transparent md:border-t-transparent"
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
                  className="data-[active=true]:bg-muted relative flex min-w-[5.5rem] flex-1 flex-col justify-center gap-1 px-4 py-3 text-left sm:min-w-[6.5rem] sm:px-6 sm:py-4"
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
        </CardAction>
      </CardHeader>
      <CardContent>
        {active?.hint ? (
          <p className="text-muted-foreground mb-3 text-xs">{active.hint}</p>
        ) : null}
        <ChartContainer config={chartConfig} className="h-[186px] w-full lg:h-[220px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 0, right: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="activity"
                  formatter={(value) => [
                    `${value} ${Number(value) === 1 ? "update" : "updates"}`,
                    active?.label ?? "Activity",
                  ]}
                />
              }
            />
            <Bar dataKey="activity" fill="var(--color-activity)" radius={5} />
          </BarChart>
        </ChartContainer>
        <p className="text-muted-foreground mt-2 text-xs tabular-nums">
          {seriesTotal} update{seriesTotal === 1 ? "" : "s"} in period
        </p>
      </CardContent>
    </Card>
  );
}
