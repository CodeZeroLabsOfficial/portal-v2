import type { SubscriptionTableRow } from "@/lib/crm/subscription-table";

/** Stripe Dashboard deep link for a subscription or subscription schedule id. */
export function subscriptionStripeDashboardUrl(id: string): string | null {
  const trimmed = id.trim();
  if (trimmed.startsWith("sub_sched_")) {
    return `https://dashboard.stripe.com/subscription_schedules/${trimmed}`;
  }
  if (trimmed.startsWith("sub_")) {
    return `https://dashboard.stripe.com/subscriptions/${trimmed}`;
  }
  return null;
}

export function canPauseSubscription(subscription: SubscriptionTableRow): boolean {
  if (subscription.paymentCollectionPaused) return false;
  if (
    subscription.status === "scheduled" ||
    subscription.status === "canceled" ||
    subscription.status === "incomplete_expired"
  ) {
    return false;
  }
  return subscription.id.trim().startsWith("sub_");
}

export function canCancelSubscription(subscription: SubscriptionTableRow): boolean {
  return subscription.status !== "canceled" && subscription.status !== "incomplete_expired";
}
