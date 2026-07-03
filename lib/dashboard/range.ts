import { endOfDay, startOfDay, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";

const MS_PER_DAY = 86400000;

export interface ResolvedDashboardRange {
  startMs: number;
  endMs: number;
  label: string;
}

export function defaultDashboardDateRange(): DateRange {
  const today = new Date();
  return {
    from: startOfDay(subDays(today, 27)),
    to: endOfDay(today),
  };
}

export function formatDashboardRangeLabel(startMs: number, endMs: number): string {
  const fmt = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${fmt.format(new Date(startMs))} – ${fmt.format(new Date(endMs))}`;
}

/** Equal-length window immediately before `[startMs, endMs]` (inclusive). */
export function priorPeriodRange(
  startMs: number,
  endMs: number,
): { startMs: number; endMs: number } {
  const duration = endMs - startMs + 1;
  return {
    startMs: startMs - duration,
    endMs: startMs - 1,
  };
}

export function periodChangePct(
  current: number,
  previous: number,
): { pct: number; neutral: boolean } {
  if (current === 0 && previous === 0) {
    return { pct: 0, neutral: true };
  }
  if (previous === 0) {
    return { pct: current > 0 ? 100 : 0, neutral: current === 0 };
  }
  const pct = ((current - previous) / previous) * 100;
  return { pct, neutral: Math.abs(pct) < 0.05 };
}

export function formatPeriodDelta(pct: number): string {
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

function dayStartMs(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Contiguous local calendar days from `startMs` through `endMs`, oldest first. */
export function buildDayStartsInRange(
  startMs: number,
  endMs: number,
): { starts: number[]; labels: string[] } {
  const first = dayStartMs(new Date(startMs));
  const last = dayStartMs(new Date(endMs));
  const starts: number[] = [];
  const labels: string[] = [];
  for (let t = first; t <= last; t += MS_PER_DAY) {
    starts.push(t);
    labels.push(
      new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" }).format(new Date(t)),
    );
  }
  return { starts, labels };
}

const MAX_DAILY_BUCKETS = 90;

/**
 * When the selected range exceeds {@link MAX_DAILY_BUCKETS} days, bucket by ISO week
 * (Monday-start) so charts stay readable.
 */
export function buildChartBuckets(
  startMs: number,
  endMs: number,
): { bucketStarts: number[]; labels: string[]; bucketMs: number } {
  const { starts, labels } = buildDayStartsInRange(startMs, endMs);
  if (starts.length <= MAX_DAILY_BUCKETS) {
    return { bucketStarts: starts, labels, bucketMs: MS_PER_DAY };
  }

  const bucketStarts: number[] = [];
  const bucketLabels: string[] = [];
  let weekStart = starts[0] ?? startMs;

  for (let i = 0; i < starts.length; i++) {
    const day = starts[i];
    const isMonday = new Date(day).getDay() === 1;
    if (i > 0 && isMonday) {
      bucketStarts.push(weekStart);
      bucketLabels.push(
        new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" }).format(
          new Date(weekStart),
        ),
      );
      weekStart = day;
    }
  }
  bucketStarts.push(weekStart);
  bucketLabels.push(
    new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" }).format(new Date(weekStart)),
  );

  return { bucketStarts, labels: bucketLabels, bucketMs: 7 * MS_PER_DAY };
}

export function resolveDashboardRange(
  range: DateRange | undefined,
  earliestMs: number,
): ResolvedDashboardRange {
  const todayEnd = endOfDay(new Date()).getTime();
  const safeEarliest = earliestMs > 0 ? earliestMs : startOfDay(subDays(new Date(), 27)).getTime();

  if (!range?.from) {
    const startMs = startOfDay(new Date(safeEarliest)).getTime();
    const endMs = todayEnd;
    return { startMs, endMs, label: formatDashboardRangeLabel(startMs, endMs) };
  }

  const startMs = startOfDay(range.from).getTime();
  const endMs = endOfDay(range.to ?? range.from).getTime();
  return { startMs, endMs, label: formatDashboardRangeLabel(startMs, endMs) };
}
