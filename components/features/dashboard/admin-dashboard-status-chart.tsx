"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
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
import { isPendingProposalStatus } from "@/lib/dashboard/pipeline-metrics";
import type { ProposalRecord } from "@/types/proposal";

interface AdminDashboardStatusChartProps {
  proposals: ProposalRecord[];
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  viewed: "Viewed",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

const chartConfig = {
  count: { label: "Proposals" },
  draft: { label: "Draft", color: "var(--chart-1)" },
  published: { label: "Published", color: "var(--chart-2)" },
  viewed: { label: "Viewed", color: "var(--chart-3)" },
  accepted: { label: "Accepted", color: "var(--chart-4)" },
  declined: { label: "Declined", color: "var(--chart-5)" },
  expired: { label: "Expired", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

export function AdminDashboardStatusChart({ proposals }: AdminDashboardStatusChartProps) {
  const chartData = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const proposal of proposals) {
      const key = proposal.status;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].map(([status, count]) => ({
      status,
      label: STATUS_LABELS[status] ?? status,
      count,
      fill: `var(--color-${status in chartConfig ? status : "draft"})`,
    }));
  }, [proposals]);

  const pendingCount = proposals.filter((p) => isPendingProposalStatus(p.status)).length;
  const total = proposals.length;

  return (
    <Card className="xl:col-span-1">
      <CardHeader>
        <CardTitle>Proposal Mix</CardTitle>
        <CardDescription>
          {pendingCount} pending of {total} total proposals
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {chartData.length === 0 ? (
          <p className="text-muted-foreground py-8 text-sm">No proposals yet</p>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px] w-full max-w-[220px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="label"
                innerRadius={50}
                outerRadius={80}
                strokeWidth={2}
              >
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 18}
                          className="fill-muted-foreground text-xs"
                        >
                          Proposals
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
