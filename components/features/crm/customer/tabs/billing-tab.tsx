"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { DateRange } from "react-day-picker";
import { Download } from "lucide-react";

import { CustomerInvoiceTableToolbar } from "@/components/features/crm/customer/customer-invoice-table-toolbar";
import { DataTable } from "@/components/shared/data-table/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyAmount } from "@/lib/common/format";
import { customerBillingMetrics } from "@/lib/crm/customer-billing-metrics";
import { invoiceStatusBadgeDisplay } from "@/lib/crm/invoice-status-badge";
import {
  invoiceInDateRange,
  mapInvoicesToTableRows,
  multiSelectColumnFilter,
  type InvoiceTableRow
} from "@/lib/crm/invoice-table";
import type { CustomerRecord } from "@/types/customer";
import type { InvoiceRecord } from "@/types/invoice";

export interface CustomerBillingTabProps {
  customer: CustomerRecord;
  invoices: InvoiceRecord[];
}

export function CustomerBillingTab({ customer, invoices }: CustomerBillingTabProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const metrics = React.useMemo(() => customerBillingMetrics(invoices), [invoices]);

  const tableRows = React.useMemo(() => {
    const rows = mapInvoicesToTableRows(invoices);
    return rows.filter((row) => invoiceInDateRange(row, dateRange));
  }, [invoices, dateRange]);

  const columns = React.useMemo<ColumnDef<InvoiceTableRow>[]>(
    () => [
      {
        id: "searchLabel",
        accessorKey: "searchLabel",
        header: () => null,
        cell: () => null,
        enableHiding: true
      },
      {
        id: "invoice",
        header: "Invoice",
        accessorKey: "invoiceLabel",
        cell: ({ row }) => {
          const invoice = row.original;
          const label = invoice.invoiceLabel;
          const primaryUrl = invoice.hostedInvoiceUrl ?? invoice.invoicePdf;

          return (
            <div className="space-y-1">
              {primaryUrl ? (
                <Link
                  href={primaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline">
                  {label}
                </Link>
              ) : (
                <span className="font-medium">{label}</span>
              )}
              {invoice.hostedInvoiceUrl && invoice.invoicePdf ? (
                <Link
                  href={invoice.invoicePdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline">
                  <Download className="size-3.5 shrink-0" aria-hidden />
                  PDF
                </Link>
              ) : null}
            </div>
          );
        }
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        filterFn: multiSelectColumnFilter,
        cell: ({ row }) => {
          const display = invoiceStatusBadgeDisplay(row.original.status);
          return <StatusBadge label={display.label} variant={display.variant} />;
        }
      },
      {
        id: "issued",
        header: "Issued",
        accessorFn: (row) => row.issuedSort,
        sortingFn: "basic",
        cell: ({ row }) => {
          const issuedAt = row.original.issuedAt;
          return (
            <span className="text-muted-foreground text-sm">
              {issuedAt ? new Date(issuedAt).toLocaleDateString() : "—"}
            </span>
          );
        }
      },
      {
        id: "amount",
        header: () => <span className="block text-right">Amount</span>,
        accessorKey: "amountDue",
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <div className="text-right tabular-nums">
              {formatCurrencyAmount(invoice.amountDue, invoice.currency)}
            </div>
          );
        }
      }
    ],
    []
  );

  return (
    <div className="space-y-4">
      {!customer.stripeCustomerId ? (
        <p className="text-muted-foreground text-sm">
          Link a Stripe customer id under Integrations to hydrate subscriptions and invoices from your
          webhook mirrors.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Paid</p>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrencyAmount(metrics.paidTotal, metrics.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Outstanding</p>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrencyAmount(metrics.outstandingTotal, metrics.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Invoices</p>
            <p className="text-2xl font-bold tabular-nums">{metrics.invoiceCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0 py-0">
        <CardContent className="space-y-2 px-6 pb-4 pt-4">
          <DataTable
            columns={columns}
            data={tableRows}
            initialPageSize={10}
            initialSorting={[{ id: "issued", desc: true }]}
            initialColumnVisibility={{ searchLabel: false }}
            emptyMessage="No invoices for this customer."
            toolbar={(table) => (
              <CustomerInvoiceTableToolbar
                table={table}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
