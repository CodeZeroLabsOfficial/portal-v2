"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef, Table } from "@tanstack/react-table";
import { Ban, ExternalLink, MoreHorizontal, Pause, Play, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { AddSubscriptionDialog } from "@/components/features/subscription/add-subscription-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { DataTableFacetedFilter } from "@/components/shared/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/shared/data-table/data-table-view-options";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatCurrencyAmount } from "@/lib/common/format";
import type { SubscriptionListRow } from "@/lib/crm/subscription-list";
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
import type { CatalogServicePickerOption } from "@/types/catalog-service";
import type { SubscriptionRecord, SubscriptionStatus } from "@/types/subscription";

export interface SubscriptionListPanelProps {
  rows: SubscriptionListRow[];
  customerOptions: { id: string; label: string }[];
  catalogServiceOptions: CatalogServicePickerOption[];
  stripePublishableKey?: string;
}

interface SubscriptionListTableRow extends SubscriptionListRow {
  id: string;
  statusFilter: string;
  productLabel: string;
  monthlyMinor?: number;
  collectionMethodLabel: string;
  createdAt?: number;
  endAt?: number;
}

const SUBSCRIPTION_LIST_STATUS_FILTER_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "trialing", label: "Trialing" },
  { value: "scheduled", label: "Scheduled" },
  { value: "paused", label: "Paused" },
  { value: "past_due", label: "Past due" },
  { value: "unpaid", label: "Unpaid" },
  { value: "canceled", label: "Canceled" }
];

function formatTableDate(ms: number | undefined): string {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return "—";
  try {
    return new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(new Date(ms));
  } catch {
    return "—";
  }
}

function resolvedMonthlyMinor(s: SubscriptionRecord): number | undefined {
  const m = s.monthlyAmountMinor;
  if (typeof m === "number") return m;
  if (s.interval === "month" && typeof s.mrrAmount === "number") return s.mrrAmount;
  if (s.interval === "year" && typeof s.mrrAmount === "number") return Math.round(s.mrrAmount / 12);
  return undefined;
}

function collectionMethodDisplay(s: SubscriptionRecord): string {
  const cm = s.collectionMethod;
  const pmType = s.defaultPaymentMethodType;
  if (cm === "send_invoice") return "Manual invoice";

  const pmLabels: Record<string, string> = {
    card: "Credit card",
    sepa_debit: "SEPA Direct Debit",
    au_becs_debit: "BECS Direct Debit",
    us_bank_account: "ACH Direct Debit",
    bacs_debit: "Bacs Direct Debit",
    acss_debit: "Canadian PAD",
    paypal: "PayPal",
    link: "Link",
    klarna: "Klarna",
    afterpay_clearpay: "Afterpay"
  };

  if (pmType && pmLabels[pmType]) return pmLabels[pmType];
  if (pmType?.trim()) {
    return pmType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  if (cm === "charge_automatically") return "Automatic charge";
  return "—";
}

function subscriptionFilterStatus(s: SubscriptionRecord): SubscriptionStatus | "paused" {
  if (s.paymentCollectionPaused && s.status !== "canceled" && s.status !== "scheduled") {
    return "paused";
  }
  return s.status;
}

function subscriptionStatusDisplay(s: SubscriptionRecord) {
  if (s.paymentCollectionPaused && s.status !== "canceled" && s.status !== "scheduled") {
    return getSubscriptionPausedBadgeDisplay();
  }
  return getSubscriptionStatusBadgeDisplay(s.status);
}

function mapToTableRows(rows: SubscriptionListRow[]): SubscriptionListTableRow[] {
  return rows.map((row) => {
    const s = row.subscription;
    const statusFilter = subscriptionFilterStatus(s);
    const productLabel = s.productName?.trim() || "—";
    return {
      ...row,
      id: s.id,
      productLabel,
      statusFilter,
      monthlyMinor: resolvedMonthlyMinor(s),
      collectionMethodLabel: collectionMethodDisplay(s),
      createdAt: s.createdAt,
      endAt: s.subscriptionEnd ?? s.currentPeriodEnd
    };
  });
}

function SubscriptionListToolbar({
  table,
  productOptions
}: {
  table: Table<SubscriptionListTableRow>;
  productOptions: { value: string; label: string }[];
}) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Search account, product, status, collection method…"
          value={(table.getColumn("accountName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("accountName")?.setFilterValue(event.target.value)}
          className="h-8 w-full sm:max-w-xs"
        />
        {table.getColumn("statusFilter") ? (
          <DataTableFacetedFilter
            column={table.getColumn("statusFilter")}
            title="Status"
            options={SUBSCRIPTION_LIST_STATUS_FILTER_OPTIONS}
          />
        ) : null}
        {productOptions.length > 0 && table.getColumn("productLabel") ? (
          <DataTableFacetedFilter
            column={table.getColumn("productLabel")}
            title="Product"
            options={productOptions}
          />
        ) : null}
        {isFiltered ? (
          <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
            Reset
            <X />
          </Button>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}

export function SubscriptionListPanel({
  rows,
  customerOptions,
  catalogServiceOptions,
  stripePublishableKey,
}: SubscriptionListPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [addOpen, setAddOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmMeta, setConfirmMeta] = React.useState({ title: "", description: "" });
  const [confirmAction, setConfirmAction] = React.useState<(() => Promise<void>) | null>(null);

  React.useEffect(() => {
    router.refresh();
  }, [router]);

  React.useEffect(() => {
    if (searchParams.get("addSubscription") !== "1") return;
    setAddOpen(true);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("addSubscription");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const tableRows = React.useMemo(() => mapToTableRows(rows), [rows]);

  const productOptions = React.useMemo(() => {
    const names = new Set<string>();
    for (const row of tableRows) {
      const name = row.productLabel;
      if (name && name !== "—") names.add(name);
    }
    return [...names]
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      .map((name) => ({ value: name, label: name }));
  }, [tableRows]);

  function openConfirm(
    meta: { title: string; description: string },
    action: () => Promise<void>
  ) {
    setConfirmMeta(meta);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  }

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

  function handlePause(id: string) {
    openConfirm(
      {
        title: "Pause payment collection",
        description:
          "Pause payment collection for this subscription? Invoices during the pause will be voided and no charges will be collected until you resume."
      },
      async () => {
        setPendingId(id);
        try {
          const res = await pauseSubscriptionAction(id);
          if (!res.ok) throw new Error(res.message ?? "Action failed.");
          toast.success("Payment collection paused.");
          router.refresh();
        } finally {
          setPendingId(null);
        }
      }
    );
  }

  function handleResume(id: string) {
    void runSubscriptionAction(id, () => resumeSubscriptionAction(id), "Payment collection resumed.");
  }

  function handleCancel(row: SubscriptionListTableRow) {
    openConfirm(
      {
        title: "Cancel subscription",
        description:
          "Cancel this subscription now? This immediately cancels it in Stripe and cannot be undone."
      },
      async () => {
        setPendingId(row.id);
        try {
          const res = await cancelSubscriptionAction(row.id);
          if (!res.ok) throw new Error(res.message ?? "Action failed.");
          toast.success("Subscription canceled.");
          router.refresh();
        } finally {
          setPendingId(null);
        }
      }
    );
  }

  const columns = React.useMemo<ColumnDef<SubscriptionListTableRow>[]>(
    () => [
      {
        id: "accountName",        accessorKey: "accountName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Account name" />,
        cell: ({ row }) => {
          const { accountName, crmCustomerId } = row.original;
          if (crmCustomerId && accountName !== "—") {
            return (
              <Link
                href={`/admin/customers/${crmCustomerId}`}
                className="font-medium hover:underline">
                {accountName}
              </Link>
            );
          }
          return <span className="text-muted-foreground">{accountName}</span>;
        },
        filterFn: (row, _id, value) => {
          const q = String(value).toLowerCase();
          if (!q) return true;
          const { accountName, productLabel, subscription, collectionMethodLabel } = row.original;
          const statusLabel = subscriptionStatusDisplay(subscription).label;
          const hay = [
            accountName,
            productLabel,
            subscription.priceId,
            subscription.status,
            statusLabel,
            collectionMethodLabel,
            subscription.customerId
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        }
      },
      {
        id: "statusFilter",
        accessorKey: "statusFilter",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        filterFn: multiSelectColumnFilter,
        cell: ({ row }) => {
          const display = subscriptionStatusDisplay(row.original.subscription);
          return <StatusBadge label={display.label} variant={display.variant} />;
        }
      },
      {
        id: "productLabel",
        accessorKey: "productLabel",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />,
        filterFn: multiSelectColumnFilter,
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.productLabel}</span>
        )
      },
      {
        id: "monthlyMinor",
        header: () => <span className="block text-right">Monthly amount</span>,
        accessorFn: (row) => row.monthlyMinor ?? 0,
        cell: ({ row }) => {
          const { monthlyMinor, subscription } = row.original;
          if (typeof monthlyMinor !== "number") {
            return <div className="text-right text-muted-foreground">—</div>;
          }
          return (
            <div className="text-right tabular-nums">
              {formatCurrencyAmount(monthlyMinor, subscription.currency)}
            </div>
          );
        }
      },
      {
        id: "collectionMethodLabel",
        accessorKey: "collectionMethodLabel",
        header: "Collection method",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.collectionMethodLabel}</span>
        )
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created date" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatTableDate(row.original.createdAt)}
          </span>
        )
      },
      {
        id: "endAt",
        accessorKey: "endAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="End date" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatTableDate(row.original.endAt)}
          </span>
        )
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const subscription = row.original.subscription;
          const busy = pendingId === subscription.id;
          const stripeUrl = subscriptionStripeDashboardUrl(subscription.id);
          const showPause = canPauseSubscription(subscription);
          const showResume = Boolean(subscription.paymentCollectionPaused);
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
                      onClick={() => handleCancel(row.original)}>
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
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Active Stripe subscriptions"
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" aria-hidden />
            Add subscription
          </Button>
        }
      />

      <AddSubscriptionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        customerOptions={customerOptions}
        catalogServiceOptions={catalogServiceOptions}
        stripePublishableKey={stripePublishableKey}
      />

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

      <DataTable
        columns={columns}
        data={tableRows}
        initialPageSize={25}
        initialSorting={[{ id: "createdAt", desc: true }]}
        emptyMessage={rows.length === 0 ? "No subscriptions yet." : "No subscriptions match your filters."}
        toolbar={(table) => (
          <SubscriptionListToolbar table={table} productOptions={productOptions} />
        )}
      />
    </div>
  );
}
