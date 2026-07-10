"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { DateRange } from "react-day-picker";
import { Ban, ExternalLink, MoreHorizontal, Pause, Play } from "lucide-react";
import { toast } from "sonner";

import { CustomerSubscriptionTableToolbar } from "@/components/features/crm/customer/customer-subscription-table-toolbar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { formatCurrencyAmount } from "@/lib/common/format";
import {
  mapSubscriptionsToTableRows,
  subscriptionInDateRange,
  type SubscriptionTableRow
} from "@/lib/crm/subscription-table";
import { multiSelectColumnFilter } from "@/lib/crm/table-filters";
import {
  canCancelSubscription,
  canPauseSubscription,
  subscriptionStripeDashboardUrl
} from "@/lib/subscription/row-actions";
import {
  getSubscriptionPausedBadgeDisplay,
  getSubscriptionStatusBadgeDisplay
} from "@/lib/subscription/status-badge";
import {
  cancelSubscriptionAction,
  pauseSubscriptionAction,
  resumeSubscriptionAction
} from "@/server/actions/subscriptions-crm";
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
  const router = useRouter();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmMeta, setConfirmMeta] = React.useState({ title: "", description: "" });
  const [confirmAction, setConfirmAction] = React.useState<(() => Promise<void>) | null>(null);

  const tableRows = React.useMemo(() => {
    const rows = mapSubscriptionsToTableRows(subscriptions);
    return rows.filter((row) => subscriptionInDateRange(row, dateRange));
  }, [subscriptions, dateRange]);

  async function runSubscriptionAction(
    id: string,
    action: () => Promise<{ ok: boolean; message?: string }>,
    successMessage: string
  ) {
    setPendingId(id);
    try {
      const res = await action();
      if (!res.ok) {
        toast.error(res.message ?? "Action failed.");
        return;
      }
      toast.success(successMessage);
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  function openConfirm(
    meta: { title: string; description: string },
    action: () => Promise<{ ok: boolean; message?: string }>,
    successMessage: string,
    subscriptionId: string
  ) {
    setConfirmMeta(meta);
    setConfirmAction(() => async () => {
      setPendingId(subscriptionId);
      try {
        const res = await action();
        if (!res.ok) {
          throw new Error(res.message ?? "Action failed.");
        }
        toast.success(successMessage);
        router.refresh();
      } finally {
        setPendingId(null);
      }
    });
    setConfirmOpen(true);
  }

  function handlePause(id: string) {
    void runSubscriptionAction(id, () => pauseSubscriptionAction(id), "Payment collection paused.");
  }

  function handleResume(id: string) {
    void runSubscriptionAction(id, () => resumeSubscriptionAction(id), "Payment collection resumed.");
  }

  function handleCancel(subscription: SubscriptionTableRow) {
    openConfirm(
      {
        title: "Cancel subscription",
        description:
          "Cancel this subscription now? This immediately cancels it in Stripe and cannot be undone."
      },
      () => cancelSubscriptionAction(subscription.id),
      "Subscription canceled.",
      subscription.id
    );
  }

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
        meta: { className: "w-28 text-right" },
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
      },
      {
        id: "actions",
        meta: { className: "w-12" },
        header: () => null,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const subscription = row.original;
          const busy = pendingId === subscription.id;
          const stripeUrl = subscriptionStripeDashboardUrl(subscription.id);
          const showPause = canPauseSubscription(subscription);
          const showResume = subscription.paymentCollectionPaused;
          const showCancel = canCancelSubscription(subscription);

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" disabled={busy}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {stripeUrl ? (
                  <DropdownMenuItem asChild>
                    <a href={stripeUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink />
                      Open
                    </a>
                  </DropdownMenuItem>
                ) : null}
                {showPause ? (
                  <DropdownMenuItem onClick={() => handlePause(subscription.id)}>
                    <Pause />
                    Pause
                  </DropdownMenuItem>
                ) : null}
                {showResume ? (
                  <DropdownMenuItem onClick={() => handleResume(subscription.id)}>
                    <Play />
                    Resume
                  </DropdownMenuItem>
                ) : null}
                {showCancel ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleCancel(subscription)}>
                      <Ban />
                      Cancel
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      }
    ],
    [pendingId]
  );

  return (
    <div className="space-y-4">
      {!customer.stripeCustomerId ? (
        <p className="text-muted-foreground text-sm">
          Link a Stripe customer id under Integrations to hydrate subscriptions and invoices from your
          webhook mirrors.
        </p>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmMeta.title}
        description={confirmMeta.description}
        confirmLabel="Confirm"
        destructive
        onConfirm={async () => {
          if (confirmAction) await confirmAction();
        }}
      />

      <Card className="min-w-0 py-0">
        <CardContent className="space-y-2 px-6 pb-4 pt-4">
          <DataTable
            columns={columns}
            data={tableRows}
            tableClassName="table-fixed"
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
