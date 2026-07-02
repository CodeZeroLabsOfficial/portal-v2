import { DEFAULT_CURRENCY } from "@/config/constants";
import type { InvoiceRecord } from "@/types/invoice";

export interface CustomerBillingMetrics {
  paidTotal: number;
  outstandingTotal: number;
  invoiceCount: number;
  /** Currency used for paid/outstanding totals (assumes single org currency). */
  currency: string;
}

function primaryCurrency(invoices: InvoiceRecord[]): string {
  return invoices.find((invoice) => invoice.currency?.trim())?.currency ?? DEFAULT_CURRENCY;
}

export function customerBillingMetrics(invoices: InvoiceRecord[]): CustomerBillingMetrics {
  const currency = primaryCurrency(invoices);

  let paidTotal = 0;
  let outstandingTotal = 0;

  for (const invoice of invoices) {
    if (invoice.status === "paid") {
      paidTotal += invoice.amountDue;
    } else if (invoice.status === "open" || invoice.status === "draft") {
      outstandingTotal += invoice.amountDue;
    }
  }

  return {
    paidTotal,
    outstandingTotal,
    invoiceCount: invoices.length,
    currency
  };
}

export function openInvoiceCount(invoices: InvoiceRecord[]): number {
  return invoices.filter((invoice) => invoice.status === "open" || invoice.status === "draft").length;
}

/** Short display label for a Stripe invoice id. */
export function formatStripeInvoiceLabel(stripeInvoiceId: string): string {
  const trimmed = stripeInvoiceId.trim();
  if (!trimmed) return "—";
  if (trimmed.length <= 16) return trimmed;
  return `…${trimmed.slice(-12)}`;
}
