import type { DateRange } from "react-day-picker";
import { endOfDay, startOfDay } from "date-fns";

import type { FacetedFilterOption } from "@/components/shared/data-table/data-table-faceted-filter";
import { getSubscriptionStatusBadgeDisplay } from "@/lib/subscription/status-badge";
import type { SubscriptionRecord, SubscriptionStatus } from "@/types/subscription";

const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  "scheduled",
  "active",
  "trialing",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
  "paused"
];

export interface SubscriptionTableRow extends SubscriptionRecord {
  searchLabel: string;
  renewsSort: number;
  productLabel: string;
}

export const SUBSCRIPTION_STATUS_FILTER_OPTIONS: FacetedFilterOption[] = SUBSCRIPTION_STATUSES.map(
  (status) => ({
    value: status,
    label: getSubscriptionStatusBadgeDisplay(status).label
  })
);

export function subscriptionRenewsAt(subscription: SubscriptionRecord): number {
  return subscription.subscriptionEnd ?? subscription.currentPeriodEnd ?? 0;
}

export function subscriptionInDateRange(
  subscription: SubscriptionTableRow,
  range: DateRange | undefined
): boolean {
  if (!range?.from) return true;
  const renewsAt = subscription.renewsSort;
  if (!renewsAt) return false;
  const start = startOfDay(range.from).getTime();
  const end = endOfDay(range.to ?? range.from).getTime();
  return renewsAt >= start && renewsAt <= end;
}

export function mapSubscriptionsToTableRows(
  subscriptions: SubscriptionRecord[]
): SubscriptionTableRow[] {
  return subscriptions.map((subscription) => {
    const statusLabel = getSubscriptionStatusBadgeDisplay(subscription.status).label;
    const productLabel = subscription.productName?.trim() || "—";
    return {
      ...subscription,
      productLabel,
      renewsSort: subscriptionRenewsAt(subscription),
      searchLabel: [productLabel, subscription.id, statusLabel].filter(Boolean).join(" ")
    };
  });
}
