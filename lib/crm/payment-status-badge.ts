import type { StatusBadgeProps } from "@/components/shared/status-badge";

export interface PaymentStatusBadgeDisplay {
  label: string;
  variant: NonNullable<StatusBadgeProps["variant"]>;
}

/** Stripe payment intent status → shared badge display for tables and dashboard aside. */
export function paymentStatusBadgeDisplay(status: string): PaymentStatusBadgeDisplay {
  const s = status.toLowerCase();
  if (s === "succeeded") {
    return { label: "Succeeded", variant: "success" };
  }
  if (
    s === "processing" ||
    s === "requires_capture" ||
    s === "requires_action" ||
    s === "requires_confirmation" ||
    s === "requires_payment_method"
  ) {
    return { label: "Pending", variant: "warning" };
  }
  if (s === "canceled") {
    return { label: "Canceled", variant: "secondary" };
  }
  if (s === "payment_failed") {
    return { label: "Failed", variant: "destructive" };
  }
  const label = s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { label, variant: "secondary" };
}
