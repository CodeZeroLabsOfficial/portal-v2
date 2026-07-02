"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Receipt } from "lucide-react";

import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { formatCurrencyAmount } from "@/lib/common/format";
import {
  customerBillingMetrics,
  formatStripeInvoiceLabel
} from "@/lib/crm/customer-billing-metrics";
import { invoiceStatusBadgeDisplay } from "@/lib/crm/invoice-status-badge";
import type { CustomerRecord } from "@/types/customer";
import type { InvoiceRecord } from "@/types/invoice";

export interface CustomerBillingTabProps {
  customer: CustomerRecord;
  invoices: InvoiceRecord[];
}

export function CustomerBillingTab({ customer, invoices }: CustomerBillingTabProps) {
  const metrics = React.useMemo(() => customerBillingMetrics(invoices), [invoices]);

  const columns = React.useMemo<ColumnDef<InvoiceRecord>[]>(
    () => [
      {
        accessorKey: "stripeInvoiceId",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" />,
        cell: ({ row }) => {
          const invoice = row.original;
          const label = formatStripeInvoiceLabel(invoice.stripeInvoiceId);
          if (invoice.hostedInvoiceUrl) {
            return (
              <Link
                href={invoice.hostedInvoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline">
                {label}
              </Link>
            );
          }
          return <span className="font-medium">{label}</span>;
        }
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const display = invoiceStatusBadgeDisplay(row.original.status);
          return <StatusBadge label={display.label} variant={display.variant} />;
        }
      },
      {
        accessorKey: "issuedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Issued" />,
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
        accessorKey: "amountDue",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Amount" className="justify-end" />
        ),
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <div className="text-right tabular-nums">
              {formatCurrencyAmount(invoice.amountDue, invoice.currency)}
            </div>
          );
        }
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const invoice = row.original;
          if (!invoice.hostedInvoiceUrl && !invoice.invoicePdf) {
            return <span className="text-muted-foreground text-sm">—</span>;
          }
          return (
            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
              {invoice.hostedInvoiceUrl ? (
                <Link
                  href={invoice.hostedInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs font-medium hover:underline">
                  View
                </Link>
              ) : null}
              {invoice.invoicePdf ? (
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
      }
    ],
    []
  );

  const sortedInvoices = React.useMemo(
    () => [...invoices].sort((a, b) => (b.issuedAt ?? 0) - (a.issuedAt ?? 0)),
    [invoices]
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

      <Card>
        <CardContent className="p-0">
          {sortedInvoices.length === 0 ? (
            <Empty className="border-0 py-12 md:py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Receipt />
                </EmptyMedia>
                <EmptyTitle className="text-xl">No billing yet</EmptyTitle>
                <EmptyDescription>
                  This customer doesn&apos;t have any invoices yet.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <DataTable columns={columns} data={sortedInvoices} emptyMessage="No invoices." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
