"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { DEFAULT_CURRENCY } from "@/config/constants";
import { formatCurrencyAmount } from "@/lib/common/format";
import { paidInvoicesInRange, sumInvoiceAmountDueMinor } from "@/lib/dashboard/metrics";
import type { InvoiceRecord } from "@/types/invoice";

interface AdminDashboardAchievementProps {
  invoices: InvoiceRecord[];
}

function ytdPaidRevenueMinor(invoices: InvoiceRecord[], year: number, nowMs: number): number {
  const start = new Date(year, 0, 1).getTime();
  const end =
    year === new Date(nowMs).getFullYear()
      ? nowMs
      : new Date(year, 11, 31, 23, 59, 59, 999).getTime();
  return sumInvoiceAmountDueMinor(paidInvoicesInRange(invoices, start, end));
}

export function AdminDashboardAchievement({ invoices }: AdminDashboardAchievementProps) {
  const nowMs = Date.now();
  const thisYear = new Date(nowMs).getFullYear();
  const lastYear = thisYear - 1;
  const thisYtd = ytdPaidRevenueMinor(invoices, thisYear, nowMs);
  const lastYtd = ytdPaidRevenueMinor(invoices, lastYear, nowMs);

  const rows = [
    { year: String(thisYear), amount: thisYtd },
    { year: String(lastYear), amount: lastYtd },
  ];

  const maxAmount = Math.max(thisYtd, lastYtd, 1);

  return (
    <Card className="xl:col-span-1">
      <CardHeader>
        <CardTitle>Revenue by Year</CardTitle>
        <CardDescription>Paid invoice revenue year-to-date comparison.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {rows.map((row) => (
          <div key={row.year} className="grid auto-rows-min gap-2">
            <div className="flex items-baseline gap-1 text-2xl leading-none font-semibold tabular-nums">
              {formatCurrencyAmount(row.amount, DEFAULT_CURRENCY)}
              <span className="text-muted-foreground text-xs font-normal">{row.year} YTD</span>
            </div>
            <ChartContainer
              config={{
                amount: {
                  label: "Revenue",
                  color: "var(--chart-1)",
                },
              }}
              className="aspect-auto h-[32px] w-full"
            >
              <BarChart
                accessibilityLayer
                layout="vertical"
                margin={{ left: 0, top: 0, right: 0, bottom: 0 }}
                data={[{ year: row.year, amount: row.amount, scaleMax: maxAmount }]}
              >
                <Bar
                  dataKey="amount"
                  fill="var(--color-amount)"
                  radius={4}
                  barSize={32}
                  background={{ fill: "var(--muted)", radius: 4 }}
                >
                  <LabelList
                    position="insideLeft"
                    dataKey="year"
                    offset={8}
                    fontSize={12}
                    fill="var(--primary-foreground)"
                  />
                </Bar>
                <YAxis dataKey="year" type="category" tickCount={1} hide />
                <XAxis dataKey="amount" type="number" hide domain={[0, maxAmount]} />
              </BarChart>
            </ChartContainer>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
