import type { AdminPortalData } from "@/server/firestore/portal-data";
import { DEFAULT_CURRENCY } from "@/config/constants";
import { formatCurrencyAmount } from "@/lib/common/format";
import type { AdminDashboardChartTabPayload } from "@/lib/dashboard/chart-payload";
import { buildAdminDashboardChartTabs } from "@/lib/dashboard/chart-payload";
import {
  countActiveLeads,
  countActiveSubscriptions,
  countCrmContacts,
  countOpenTickets,
  countOpenTicketsByUrgency,
  countTasksDueAndOverdue,
  leadsCreatedInRange,
  summarizePaidInvoiceRevenue,
  summarizeSucceededPaymentsInRange,
} from "@/lib/dashboard/metrics";
import {
  countPendingProposals,
  sumPendingProposalValueMinor,
} from "@/lib/dashboard/pipeline-metrics";
import {
  formatPeriodDelta,
  periodChangePct,
  priorPeriodRange,
  type ResolvedDashboardRange,
} from "@/lib/dashboard/range";

export interface DashboardKpiCard {
  title: string;
  value: string;
  delta?: string;
  deltaPositive: boolean;
  deltaNeutral: boolean;
  footer: string;
}

export interface DashboardViewModel {
  range: ResolvedDashboardRange;
  kpis: {
    revenue: DashboardKpiCard;
    payments: DashboardKpiCard;
    activeLeads: DashboardKpiCard;
    openTickets: DashboardKpiCard;
  };
  chartTabs: AdminDashboardChartTabPayload[];
  openTicketTotal: number;
  ticketBuckets: ReturnType<typeof countOpenTicketsByUrgency>;
  taskDue: ReturnType<typeof countTasksDueAndOverdue>;
}

function earliestDataTimestamp(data: AdminPortalData): number {
  const stamps: number[] = [];
  for (const c of data.crmCustomers) {
    if (c.createdAt > 0) stamps.push(c.createdAt);
  }
  for (const s of data.subscriptions) {
    if (s.updatedAt > 0) stamps.push(s.updatedAt);
  }
  for (const p of data.proposals) {
    stamps.push(p.createdAt, p.updatedAt);
  }
  for (const inv of data.invoices) {
    if (inv.paidAt) stamps.push(inv.paidAt);
  }
  for (const pay of data.payments) {
    if (pay.createdAt > 0) stamps.push(pay.createdAt);
  }
  for (const t of data.tasks) {
    if (t.updatedAt > 0) stamps.push(t.updatedAt);
  }
  for (const t of data.supportTickets) {
    if (t.updatedAt > 0) stamps.push(t.updatedAt);
  }
  return stamps.length > 0 ? Math.min(...stamps) : 0;
}

export function resolveDashboardEarliestMs(data: AdminPortalData): number {
  return earliestDataTimestamp(data);
}

export function buildDashboardViewModel(
  data: AdminPortalData,
  range: ResolvedDashboardRange,
  now: Date = new Date(),
): DashboardViewModel {
  const { startMs, endMs } = range;
  const prior = priorPeriodRange(startMs, endMs);

  const revenueCurrent = summarizePaidInvoiceRevenue(data.invoices, startMs, endMs);
  const revenuePrior = summarizePaidInvoiceRevenue(data.invoices, prior.startMs, prior.endMs);
  const revenueChange = periodChangePct(revenueCurrent.amountMinor, revenuePrior.amountMinor);

  const paymentsCurrent = summarizeSucceededPaymentsInRange(data.payments, startMs, endMs);
  const paymentsPrior = summarizeSucceededPaymentsInRange(data.payments, prior.startMs, prior.endMs);
  const paymentsChange = periodChangePct(paymentsCurrent.amountMinor, paymentsPrior.amountMinor);

  const leadsNewInPeriod = leadsCreatedInRange(data.crmCustomers, startMs, endMs);
  const leadsNewPrior = leadsCreatedInRange(data.crmCustomers, prior.startMs, prior.endMs);
  const leadsChange = periodChangePct(leadsNewInPeriod, leadsNewPrior);
  const activeLeadCount = countActiveLeads(data.crmCustomers);

  const activeSubCount = countActiveSubscriptions(data.subscriptions);
  const contactCount = countCrmContacts(data.crmCustomers);
  const totalSubs = data.subscriptions.length;
  const activeOrTrialCount = data.subscriptions.filter(
    (s) => s.status === "active" || s.status === "trialing",
  ).length;
  const utilPct =
    contactCount === 0
      ? null
      : Math.min(100, Math.round((activeSubCount / contactCount) * 1000) / 10);
  const churnPct =
    totalSubs === 0 ? 0 : Math.round(((totalSubs - activeOrTrialCount) / totalSubs) * 1000) / 10;

  const pendingCount = countPendingProposals(data.proposals);
  const pendingValueMinor = sumPendingProposalValueMinor(data.proposals);
  const ticketBuckets = countOpenTicketsByUrgency(data.supportTickets);
  const openTicketTotal = countOpenTickets(data.supportTickets);
  const taskDue = countTasksDueAndOverdue(data.tasks, now);
  const taskHeadlineTotal = taskDue.overdue + taskDue.dueThisWeek;

  const chartTabs = buildAdminDashboardChartTabs(
    data,
    startMs,
    endMs,
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

  return {
    range,
    kpis: {
      revenue: {
        title: "Revenue",
        value: formatCurrencyAmount(revenueCurrent.amountMinor, DEFAULT_CURRENCY),
        delta: formatPeriodDelta(revenueChange.pct),
        deltaPositive: revenueChange.pct > 0,
        deltaNeutral: revenueChange.neutral,
        footer: `Previous period: ${formatCurrencyAmount(revenuePrior.amountMinor, DEFAULT_CURRENCY)}`,
      },
      payments: {
        title: "Payments",
        value: formatCurrencyAmount(paymentsCurrent.amountMinor, DEFAULT_CURRENCY),
        delta: formatPeriodDelta(paymentsChange.pct),
        deltaPositive: paymentsChange.pct > 0,
        deltaNeutral: paymentsChange.neutral,
        footer: `${paymentsCurrent.count} payment${paymentsCurrent.count === 1 ? "" : "s"} · Previous ${formatCurrencyAmount(paymentsPrior.amountMinor, DEFAULT_CURRENCY)}`,
      },
      activeLeads: {
        title: "Active Leads",
        value: String(activeLeadCount),
        delta: formatPeriodDelta(leadsChange.pct),
        deltaPositive: leadsChange.pct > 0,
        deltaNeutral: leadsChange.neutral,
        footer: `${leadsNewInPeriod} new in selected period`,
      },
      openTickets: {
        title: "Open Tickets",
        value: String(openTicketTotal),
        delta: undefined,
        deltaPositive: false,
        deltaNeutral: true,
        footer: "Support metrics coming soon",
      },
    },
    chartTabs,
    openTicketTotal,
    ticketBuckets,
    taskDue,
  };
}
