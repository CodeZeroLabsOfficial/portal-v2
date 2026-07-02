import type { DateRange } from "react-day-picker";
import { endOfDay, startOfDay } from "date-fns";

import type { FacetedFilterOption } from "@/components/shared/data-table/data-table-faceted-filter";
import { formatStripeInvoiceLabel } from "@/lib/crm/customer-billing-metrics";
import { invoiceStatusBadgeDisplay } from "@/lib/crm/invoice-status-badge";
import { multiSelectColumnFilter } from "@/lib/crm/table-filters";
import type { InvoiceRecord, InvoiceStatus } from "@/types/invoice";

export { multiSelectColumnFilter };

const INVOICE_STATUSES: InvoiceStatus[] = [
  "draft",
  "open",
  "paid",
  "void",
  "uncollectible"
];

export interface InvoiceTableRow extends InvoiceRecord {
  searchLabel: string;
  issuedSort: number;
  invoiceLabel: string;
}

export const INVOICE_STATUS_FILTER_OPTIONS: FacetedFilterOption[] = INVOICE_STATUSES.map(
  (status) => ({
    value: status,
    label: invoiceStatusBadgeDisplay(status).label
  })
);

export function invoiceInDateRange(invoice: InvoiceTableRow, range: DateRange | undefined): boolean {
  if (!range?.from) return true;
  const issuedAt = invoice.issuedAt;
  if (!issuedAt) return false;
  const start = startOfDay(range.from).getTime();
  const end = endOfDay(range.to ?? range.from).getTime();
  return issuedAt >= start && issuedAt <= end;
}

export function mapInvoicesToTableRows(invoices: InvoiceRecord[]): InvoiceTableRow[] {
  return invoices.map((invoice) => {
    const statusLabel = invoiceStatusBadgeDisplay(invoice.status).label;
    return {
      ...invoice,
      invoiceLabel: formatStripeInvoiceLabel(invoice.stripeInvoiceId),
      issuedSort: invoice.issuedAt ?? 0,
      searchLabel: [invoice.stripeInvoiceId, statusLabel].filter(Boolean).join(" ")
    };
  });
}
