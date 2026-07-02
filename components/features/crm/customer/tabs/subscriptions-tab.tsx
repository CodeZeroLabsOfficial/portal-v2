"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { DateRange } from "react-day-picker";

import { CustomerSubscriptionTableToolbar } from "@/components/features/crm/customer/customer-subscription-table-toolbar";
import { DataTable } from "@/components/shared/data-table/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyAmount } from "@/lib/common/format";
import {
  mapSubscriptionsToTableRows,
  subscriptionInDateRange,
  type SubscriptionTableRow
} from "@/lib/crm/subscription-table";
import { multiSelectColumnFilter } from "@/lib/crm/table-filters";
import {
  getSubscriptionPausedBadgeDisplay,
  getSubscriptionStatusBadgeDisplay
} from "@/lib/subscription/status-badge";
import type { CustomerRecord } from "@/types/customer";
import type { SubscriptionRecord } from "@/types/subscription";

export interface CustomerSubscriptionsTabProps {
  customer: CustomerRecord;
  subscriptions: SubscriptionRecord[];
}

export function CustomerSubscriptionsTab({
  customer,
  subscriptions
}: CustomerSubscriptionsTabProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);

  const tableRows = React.useMemo(() => {
    const rows = mapSubscriptionsToTableRows(subscriptions);
    return rows.filter((row) => subscriptionInDateRange(row, dateRange));
  }, [subscriptions, dateRange]);

  const columns = React.useMemo<ColumnDef<SubscriptionTableRow>[]>(
    () => [
      {
        id: "searchLabel",
        accessorKey: "searchLabel",
        header: () => null,
        cell: () => null,
        enableHiding: true
      },
      {
        id: "product",
        header: "Product",
        accessorKey: "productLabel",
        cell: ({ row }) => <span className="font-medium">{row.original.productLabel}</span>
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        filterFn: multiSelectColumnFilter,
        cell: ({ row }) => {
          const subscription = row.original;
          const display = getSubscriptionStatusBadgeDisplay(subscription.status);
          return (
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge label={display.label} variant={display.variant} />
              {subscription.paymentCollectionPaused ? (
                <StatusBadge
                  label={getSubscriptionPausedBadgeDisplay().label}
                  variant={getSubscriptionPausedBadgeDisplay().variant}
                />
              ) : null}
            </div>
          );
        }
      },
      {
        id: "renews",
        header: "Renews",
        accessorFn: (row) => row.renewsSort,
        sortingFn: "basic",
        cell: ({ row }) => {
          const renewsAt = row.original.renewsSort;
          return (
            <span className="text-muted-foreground text-sm">
              {renewsAt ? new Date(renewsAt).toLocaleDateString() : "—"}
            </span>
          );
        }
      },
      {
        id: "mrr",
        header: () => <span className="block text-right">Amount</span>,
        accessorFn: (row) => row.mrrAmount ?? row.monthlyAmountMinor ?? 0,
        cell: ({ row }) => {
          const subscription = row.original;
          const amount = subscription.mrrAmount ?? subscription.monthlyAmountMinor;
          if (amount == null) {
            return <div className="text-right text-muted-foreground">—</div>;
          }
          return (
            <div className="text-right tabular-nums">
              {formatCurrencyAmount(amount, subscription.currency)}
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

      <Card className="min-w-0 py-0">
        <CardContent className="space-y-2 px-6 pb-4 pt-4">
          <DataTable
            columns={columns}
            data={tableRows}
            initialPageSize={10}
            initialSorting={[{ id: "renews", desc: true }]}
            initialColumnVisibility={{ searchLabel: false }}
            emptyMessage="No subscriptions for this customer."
            toolbar={(table) => (
              <CustomerSubscriptionTableToolbar
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
