import {
  ArrowDownRight,
  ArrowUpRight,
  LineChart,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { AdminDashboardChart } from "@/components/features/dashboard/admin-dashboard-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { DEFAULT_CURRENCY } from "@/config/constants";
import { formatCurrencyAmount } from "@/lib/common/format";
import { buildAdminDashboardChartTabs } from "@/lib/dashboard/chart-payload";
import {
  comparableLastMonthPaymentMinor,
  countActiveSubscriptions,
  countCrmContacts,
  crmContactsMomStats,
  paidInvoiceRevenueMomStats,
  succeededPaymentsMomStats,
  summarizeSucceededPayments,
  sumActiveSubscriptionMrrMinor,
} from "@/lib/dashboard/metrics";
import { iterateProposalContentBlocks } from "@/lib/proposal/blocks";
import type { AdminPortalData } from "@/server/firestore/portal-data";
import type { ProposalBlock, ProposalRecord } from "@/types/proposal";
import type { SupportTicketRecord } from "@/types/support-ticket";
import type { TaskRecord } from "@/types/task";
import { cn } from "@/lib/utils";

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

function formatShortChartDate(d: Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

const PRICING_MINOR_KEYS = [
  "totalMinorUnits",
  "amountMinorUnits",
  "subtotalMinorUnits",
  "totalCents",
  "amountCents",
  "amount",
] as const;

function extractPricingMinorFromBlock(block: ProposalBlock): number {
  if (block.type === "packages") {
    let maxVal = 0;
    for (const tier of block.tiers) {
      const v12 = tier.monthlyCost12Minor * 12 + (tier.upfrontCost12Minor ?? 0);
      const v24 = tier.monthlyCost24Minor * 24;
      maxVal = Math.max(maxVal, v12, v24);
    }
    return maxVal > 0 ? Math.round(maxVal) : 0;
  }
  if (block.type !== "pricing") {
    return 0;
  }
  if (block.lineItems.length > 0) {
    let sum = 0;
    for (const li of block.lineItems) {
      const unit = typeof li.unitAmountMinor === "number" ? li.unitAmountMinor : 0;
      const qty = typeof li.quantity === "number" && li.quantity > 0 ? li.quantity : 1;
      sum += Math.round(unit * qty);
    }
    if (sum > 0) return sum;
  }
  const record = block as unknown as Record<string, unknown>;
  for (const key of PRICING_MINOR_KEYS) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.round(value);
    }
  }
  return 0;
}

function sumPendingProposalValueMinor(proposals: ProposalRecord[]): number {
  return proposals
    .filter((p) => p.status === "draft" || p.status === "published" || p.status === "viewed")
    .reduce(
      (sum, proposal) =>
        sum +
        [...iterateProposalContentBlocks(proposal.document.blocks)].reduce(
          (blockSum, block) => blockSum + extractPricingMinorFromBlock(block),
          0,
        ),
      0,
    );
}

function isTaskOpenStatus(status: string): boolean {
  const normalized = status.toLowerCase();
  return (
    normalized !== "done" &&
    normalized !== "completed" &&
    normalized !== "cancelled" &&
    normalized !== "canceled" &&
    normalized !== "closed"
  );
}

function isTicketOpenStatus(status: string): boolean {
  const normalized = status.toLowerCase();
  return (
    normalized !== "resolved" &&
    normalized !== "closed" &&
    normalized !== "done" &&
    normalized !== "cancelled" &&
    normalized !== "canceled"
  );
}

function startOfCalendarWeekMs(d: Date): number {
  const cursor = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayOfWeek = cursor.getDay();
  const toMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  cursor.setDate(cursor.getDate() + toMonday);
  cursor.setHours(0, 0, 0, 0);
  return cursor.getTime();
}

function endOfCalendarWeekMs(weekStartMs: number): number {
  return weekStartMs + 7 * 86400000 - 1;
}

function countTasksDueAndOverdue(
  tasks: TaskRecord[],
  now: Date,
): { dueThisWeek: number; overdue: number } {
  const nowMs = now.getTime();
  const weekStart = startOfCalendarWeekMs(now);
  const weekEnd = endOfCalendarWeekMs(weekStart);
  let dueThisWeek = 0;
  let overdue = 0;
  for (const task of tasks) {
    if (!isTaskOpenStatus(task.status)) {
      continue;
    }
    const due = task.dueAt;
    if (due === undefined || !Number.isFinite(due)) {
      continue;
    }
    if (due < nowMs) {
      overdue += 1;
    } else if (due >= weekStart && due <= weekEnd) {
      dueThisWeek += 1;
    }
  }
  return { dueThisWeek, overdue };
}

function countOpenTicketsByUrgency(tickets: SupportTicketRecord[]): {
  critical: number;
  high: number;
  medium: number;
} {
  const open = tickets.filter((ticket) => isTicketOpenStatus(ticket.status));
  let critical = 0;
  let high = 0;
  let medium = 0;
  for (const ticket of open) {
    if (ticket.urgency === "critical") {
      critical += 1;
    } else if (ticket.urgency === "high") {
      high += 1;
    } else {
      medium += 1;
    }
  }
  return { critical, high, medium };
}

interface AdminDashboardProps {
  data: AdminPortalData;
  displayName: string;
  userLabel: string;
}

export function AdminDashboard({ data, displayName, userLabel }: AdminDashboardProps) {
  const name = firstName(displayName, userLabel);
  const now = new Date();
  const today = formatWelcomeDate(now);
  const nowMs = now.getTime();

  const contactCount = countCrmContacts(data.crmCustomers);
  const clientsMom = crmContactsMomStats(data.crmCustomers, now);
  const clientsDeltaStr = `${clientsMom.pct >= 0 ? "+" : ""}${clientsMom.pct.toFixed(1)}%`;

  const mrrMinor = sumActiveSubscriptionMrrMinor(data.subscriptions);
  const activeSubCount = countActiveSubscriptions(data.subscriptions);
  const paidMom = paidInvoiceRevenueMomStats(data.invoices, now);
  const mrrGrowthStr = `${paidMom.pct >= 0 ? "+" : ""}${paidMom.pct.toFixed(1)}%`;

  const paymentsSummary = summarizeSucceededPayments(data.payments, now);
  const paymentsMom = succeededPaymentsMomStats(data.payments, now);
  const paymentsLastMonthMinor = comparableLastMonthPaymentMinor(data.payments, now);
  const paymentsDeltaStr = paymentsSummary.useYtd
    ? undefined
    : `${paymentsMom.pct >= 0 ? "+" : ""}${paymentsMom.pct.toFixed(1)}%`;

  const totalSubs = data.subscriptions.length;
  const activeOrTrialCount = data.subscriptions.filter(
    (subscription) => subscription.status === "active" || subscription.status === "trialing",
  ).length;
  const utilPct =
    contactCount === 0
      ? null
      : Math.min(100, Math.round((activeSubCount / contactCount) * 1000) / 10);
  const churnPct =
    totalSubs === 0 ? 0 : Math.round(((totalSubs - activeOrTrialCount) / totalSubs) * 1000) / 10;

  const pendingProposals = data.proposals.filter(
    (proposal) =>
      proposal.status === "draft" || proposal.status === "published" || proposal.status === "viewed",
  );
  const pendingCount = pendingProposals.length;
  const pendingValueMinor = sumPendingProposalValueMinor(data.proposals);

  const ticketBuckets = countOpenTicketsByUrgency(data.supportTickets);
  const openTicketTotal = ticketBuckets.critical + ticketBuckets.high + ticketBuckets.medium;
  const taskDue = countTasksDueAndOverdue(data.tasks, now);
  const taskHeadlineTotal = taskDue.overdue + taskDue.dueThisWeek;

  const chartTabs = buildAdminDashboardChartTabs(
    data,
    now,
    {
      subscriptions: String(activeSubCount),
      proposals: String(pendingCount),
      supportTickets: String(openTicketTotal),
      tasks: String(taskHeadlineTotal),
    },
    {
      subscriptions: `${utilPct === null ? "—" : `${utilPct}%`} utilization · ${churnPct}% churn (non-active share)`,
      proposals: `Pending pipeline · ${formatCurrencyAmount(pendingValueMinor, DEFAULT_CURRENCY)} total value`,
      supportTickets: `Critical ${ticketBuckets.critical} · High ${ticketBuckets.high} · Medium ${ticketBuckets.medium}`,
      tasks:
        taskDue.overdue === 0 && taskDue.dueThisWeek === 0
          ? "No open tasks with due dates in range"
          : [
              taskDue.overdue > 0 ? `${taskDue.overdue} overdue` : null,
              taskDue.dueThisWeek > 0 ? `${taskDue.dueThisWeek} due remainder of week` : null,
            ]
              .filter(Boolean)
              .join(" · "),
    },
  );

  const chartRangeEnd = new Date(nowMs);
  const chartRangeStart = new Date(nowMs);
  chartRangeStart.setDate(chartRangeStart.getDate() - 13);
  const chartRangeLabel = `${formatShortChartDate(chartRangeStart)} – ${formatShortChartDate(chartRangeEnd)}`;

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h1">Welcome back, {name}!</Typography>
        <Typography variant="muted" className="mt-1">
          Here are your stats for {today}
        </Typography>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          heading="Customers"
          metricLabel="CRM contacts"
          value={String(contactCount)}
          footer={`Last month: ${clientsMom.lastMonthNew} new sign-up${clientsMom.lastMonthNew === 1 ? "" : "s"}`}
          delta={clientsDeltaStr}
          positive={clientsMom.pct > 0}
          neutralDelta={clientsMom.neutral}
          icon={Users}
        />
        <MetricCard
          heading="Revenue"
          metricLabel="MRR"
          value={formatCurrencyAmount(mrrMinor, DEFAULT_CURRENCY)}
          footer={`Last month: ${formatCurrencyAmount(paidMom.lastMinor, DEFAULT_CURRENCY)}`}
          delta={mrrGrowthStr}
          positive={paidMom.pct > 0}
          neutralDelta={paidMom.neutral}
          icon={LineChart}
        />
        <MetricCard
          heading="Payments"
          metricLabel="Total revenue"
          value={formatCurrencyAmount(paymentsSummary.amountMinor, DEFAULT_CURRENCY)}
          footer={
            paymentsSummary.useYtd
              ? `${paymentsSummary.count} payments · ${paymentsSummary.year} YTD`
              : `Last month ${formatCurrencyAmount(paymentsLastMonthMinor, DEFAULT_CURRENCY)}`
          }
          delta={paymentsDeltaStr}
          positive={paymentsDeltaStr !== undefined && paymentsMom.pct > 0}
          neutralDelta={
            paymentsDeltaStr !== undefined ? paymentsMom.neutral : paymentsSummary.amountMinor === 0
          }
          icon={Wallet}
        />
      </div>

      <AdminDashboardChart tabs={chartTabs} chartRangeLabel={chartRangeLabel} />
    </div>
  );
}

interface MetricCardProps {
  heading: string;
  metricLabel: string;
  value: string;
  footer?: string;
  delta?: string;
  positive: boolean;
  neutralDelta?: boolean;
  icon: LucideIcon;
}

function MetricCard({
  heading,
  metricLabel,
  value,
  footer,
  delta,
  positive,
  neutralDelta,
  icon: Icon,
}: MetricCardProps) {
  const showDelta = typeof delta === "string" && delta.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
            <Icon className="size-4" aria-hidden />
          </span>
          {heading}
        </CardTitle>
        <CardDescription>{metricLabel}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <Typography variant="display-lg" className="tabular-nums">
            {value}
          </Typography>
          {showDelta ? (
            <div
              className={cn(
                "text-right text-xs font-medium tabular-nums",
                neutralDelta
                  ? "text-muted-foreground"
                  : positive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive",
              )}
            >
              <span className="inline-flex items-center justify-end gap-0.5">
                <span>{delta}</span>
                {neutralDelta ? null : positive ? (
                  <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
                ) : (
                  <ArrowDownRight className="size-3.5 shrink-0" aria-hidden />
                )}
              </span>
            </div>
          ) : null}
        </div>
        {footer ? <p className="text-muted-foreground text-xs">{footer}</p> : null}
      </CardContent>
    </Card>
  );
}
