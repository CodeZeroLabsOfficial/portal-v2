import type { VariantProps } from "class-variance-authority";

import type { badgeVariants } from "@/components/ui/badge";
import type { CustomerSubscriptionRollup } from "@/types/customer";
import type { SubscriptionStatus } from "@/types/subscription";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export interface SubscriptionStatusBadgeDisplay {
  label: string;
  variant: BadgeVariant;
}

/** Maps subscription status to shared badge variants (customer list, subscriptions hub). */
export function getSubscriptionStatusBadgeDisplay(
  status: SubscriptionStatus | CustomerSubscriptionRollup,
): SubscriptionStatusBadgeDisplay {
  if (status === "none") {
    return { label: "No subscription", variant: "info" };
  }
  if (status === "active" || status === "trialing") {
    return {
      label: status === "trialing" ? "Trialing" : "Active",
      variant: "success",
    };
  }
  if (status === "scheduled") {
    return { label: "Scheduled", variant: "orange" };
  }
  if (status === "past_due" || status === "unpaid") {
    return {
      label: status === "past_due" ? "Past due" : "Unpaid",
      variant: "warning",
    };
  }
  if (status === "canceled") {
    return { label: "Canceled", variant: "secondary" };
  }
  if (status === "paused") {
    return { label: "Paused", variant: "purple" };
  }
  return {
    label: status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    variant: "secondary",
  };
}

/** Payment-collection pause — subscriptions list only. */
export function getSubscriptionPausedBadgeDisplay(): SubscriptionStatusBadgeDisplay {
  return { label: "Paused", variant: "purple" };
}
