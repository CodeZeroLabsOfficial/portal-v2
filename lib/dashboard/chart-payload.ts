import type { AdminPortalData } from "@/server/firestore/portal-data";
import { buildChartBuckets } from "@/lib/dashboard/range";

export type AdminDashboardChartTabId = "subscriptions" | "proposals" | "supportTickets" | "tasks";

export interface AdminDashboardChartTabPayload {
  id: AdminDashboardChartTabId;
  label: string;
  valueDisplay: string;
  hint?: string;
  points: number[];
  xLabels: string[];
}

/**
 * Buckets `timestamps` into contiguous windows defined by `bucketStarts`.
 * `bucketMs` is the width of each bucket (one day or one week).
 */
function binTimestampsInBuckets(
  timestamps: number[],
  bucketStarts: number[],
  bucketMs: number,
): number[] {
  const counts = new Array(bucketStarts.length).fill(0);
  if (bucketStarts.length === 0) return counts;
  const first = bucketStarts[0];
  const totalMs = bucketStarts.length * bucketMs;
  for (const ts of timestamps) {
    if (typeof ts !== "number" || !Number.isFinite(ts) || ts <= 0) continue;
    const offset = ts - first;
    if (offset < 0 || offset >= totalMs) continue;
    counts[Math.floor(offset / bucketMs)] += 1;
  }
  return counts;
}

/**
 * Activity per bucket in the selected range: subscriptions/proposals/tickets/tasks.
 * Proposals also consider `createdAt` as an activity signal.
 */
export function buildAdminDashboardChartTabs(
  data: AdminPortalData,
  startMs: number,
  endMs: number,
  headlines: {
    subscriptions: string;
    proposals: string;
    supportTickets: string;
    tasks: string;
  },
  hints: Record<AdminDashboardChartTabId, string | undefined>,
): AdminDashboardChartTabPayload[] {
  const { bucketStarts, labels, bucketMs } = buildChartBuckets(startMs, endMs);

  const subPoints = binTimestampsInBuckets(
    data.subscriptions.map((s) => s.updatedAt),
    bucketStarts,
    bucketMs,
  );

  const proposalPoints = binTimestampsInBuckets(
    data.proposals.map((p) => Math.max(p.createdAt, p.updatedAt)),
    bucketStarts,
    bucketMs,
  );

  const ticketPoints = binTimestampsInBuckets(
    data.supportTickets.map((t) => t.updatedAt),
    bucketStarts,
    bucketMs,
  );

  const taskPoints = binTimestampsInBuckets(
    data.tasks.map((t) => t.updatedAt),
    bucketStarts,
    bucketMs,
  );

  return [
    {
      id: "subscriptions",
      label: "Subscriptions",
      valueDisplay: headlines.subscriptions,
      hint: hints.subscriptions,
      points: subPoints,
      xLabels: labels,
    },
    {
      id: "proposals",
      label: "Proposals",
      valueDisplay: headlines.proposals,
      hint: hints.proposals,
      points: proposalPoints,
      xLabels: labels,
    },
    {
      id: "supportTickets",
      label: "Support Tickets",
      valueDisplay: headlines.supportTickets,
      hint: hints.supportTickets,
      points: ticketPoints,
      xLabels: labels,
    },
    {
      id: "tasks",
      label: "Tasks",
      valueDisplay: headlines.tasks,
      hint: hints.tasks,
      points: taskPoints,
      xLabels: labels,
    },
  ];
}
