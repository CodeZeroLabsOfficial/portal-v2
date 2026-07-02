import type { StatusBadgeProps } from "@/components/shared/status-badge";
import type { InvoiceStatus } from "@/types/invoice";

export interface InvoiceStatusBadgeDisplay {
  label: string;
  variant: NonNullable<StatusBadgeProps["variant"]>;
}

const INVOICE_STATUS_BADGE: Record<InvoiceStatus, InvoiceStatusBadgeDisplay> = {
  draft: { label: "Draft", variant: "secondary" },
  open: { label: "Open", variant: "warning" },
  paid: { label: "Paid", variant: "success" },
  void: { label: "Void", variant: "secondary" },
  uncollectible: { label: "Uncollectible", variant: "destructive" }
};

export function invoiceStatusBadgeDisplay(status: InvoiceStatus): InvoiceStatusBadgeDisplay {
  return INVOICE_STATUS_BADGE[status] ?? { label: status, variant: "secondary" };
}
