"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef, Table } from "@tanstack/react-table";
import { Loader2, MoreHorizontal, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { AddSubscriptionDialog } from "@/components/features/subscription/add-subscription-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { DataTableFacetedFilter } from "@/components/shared/data-table/data-table-faceted-filter";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  deleteSubscriptionAction,
  pauseSubscriptionAction,
  resumeSubscriptionAction
} from "@/server/actions/subscriptions-crm";
import type { CatalogServicePickerOption } from "@/types/catalog-service";
import type { SubscriptionRecord, SubscriptionStatus } from "@/types/subscription";

export interface SubscriptionListPanelProps {
  rows: SubscriptionListRow[];
  customerOptions: { id: string; label: string }[];
  catalogServiceOptions: CatalogServicePickerOption[];
}

interface SubscriptionListTableRow extends SubscriptionListRow {
  id: string;
  searchLabel: string;
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
    const statusLabel = subscriptionStatusDisplay(s).label;
    const productLabel = s.productName?.trim() || "—";
    return {
      ...row,
      id: s.id,
      productLabel,
      statusFilter,
      monthlyMinor: resolvedMonthlyMinor(s),
      collectionMethodLabel: collectionMethodDisplay(s),
      createdAt: s.createdAt,
      endAt: s.subscriptionEnd ?? s.currentPeriodEnd,
      searchLabel: [
        row.accountName,
        productLabel,
        s.priceId,
        s.status,
        statusLabel,
        collectionMethodDisplay(s),
        s.customerId
      ]
        .filter(Boolean)
        .join(" ")
    };
  });
}

function SubscriptionListToolbar({
  table,
  productOptions,
  onBulkDelete,
  bulkDeleteDisabled
}: {
  table: Table<SubscriptionListTableRow>;
  productOptions: { value: string; label: string }[];
  onBulkDelete: () => void;
  bulkDeleteDisabled: boolean;
}) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex min-w-0 w-full flex-wrap items-center justify-between gap-2 py-2">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Search status, customer, product, collection method…"
          value={(table.getColumn("searchLabel")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("searchLabel")?.setFilterValue(event.target.value)}
          className="h-8 min-w-0 flex-1 sm:max-w-xs"
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
          <Button variant="ghost" size="sm" className="h-8" onClick={() => table.resetColumnFilters()}>
            Reset
            <X className="size-4" aria-hidden />
          </Button>
        ) : null}
      </div>
      {selectedCount > 0 ? (
        <Button variant="destructive" size="sm" disabled={bulkDeleteDisabled} onClick={onBulkDelete}>
          <Trash2 className="size-4" aria-hidden />
          Delete ({selectedCount})
        </Button>
      ) : null}
    </div>
  );
}

export function SubscriptionListPanel({
  rows,
  customerOptions,
  catalogServiceOptions
}: SubscriptionListPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [addOpen, setAddOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmMeta, setConfirmMeta] = React.useState({ title: "", description: "" });
  const [confirmAction, setConfirmAction] = React.useState<(() => Promise<void>) | null>(null);
  const tableRef = React.useRef<Table<SubscriptionListTableRow> | null>(null);

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
          "Cancel this subscription at the end of the current billing period? No refund will be issued."
      },
      async () => {
        setPendingId(row.id);
        try {
          const res = await cancelSubscriptionAction(row.id);
          if (!res.ok) throw new Error(res.message ?? "Action failed.");
          toast.success("Subscription set to cancel at period end.");
          router.refresh();
        } finally {
          setPendingId(null);
        }
      }
    );
  }

  function handleDelete(row: SubscriptionListTableRow) {
    openConfirm(
      {
        title: "Delete subscription",
        description:
          "Delete this subscription now? This immediately cancels it in Stripe and cannot be undone."
      },
      async () => {
        setPendingId(row.id);
        try {
          const res = await deleteSubscriptionAction(row.id);
          if (!res.ok) throw new Error(res.message ?? "Action failed.");
          toast.success("Subscription deleted.");
          router.refresh();
        } finally {
          setPendingId(null);
        }
      }
    );
  }

  function handleBulkDelete() {
    const table = tableRef.current;
    if (!table) return;
    const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
    if (ids.length === 0) return;
    openConfirm(
      {
        title: `Delete ${ids.length} subscription${ids.length === 1 ? "" : "s"}`,
        description: `Delete selected subscriptions now? This immediately cancels them in Stripe.`
      },
      async () => {
        setBulkBusy(true);
        const failed: string[] = [];
        for (const id of ids) {
          const res = await deleteSubscriptionAction(id);
          if (!res.ok) failed.push(id);
        }
        setBulkBusy(false);
        if (failed.length > 0) {
          toast.error(`Deleted ${ids.length - failed.length} of ${ids.length}. ${failed.length} failed.`);
        } else {
          toast.success(`Deleted ${ids.length} subscription${ids.length === 1 ? "" : "s"}.`);
          table.resetRowSelection();
        }
        router.refresh();
      }
    );
  }

  const columns = React.useMemo<ColumnDef<SubscriptionListTableRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select subscription for ${row.original.accountName}`}
          />
        ),
        enableSorting: false,
        enableHiding: false
      },
      {
        id: "searchLabel",
        accessorKey: "searchLabel",
        header: () => null,
        cell: () => null,
        enableHiding: true
      },
      {
        id: "accountName",
        accessorKey: "accountName",
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
        }
      },
      {
        id: "statusFilter",
        accessorKey: "statusFilter",
        header: "Status",
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
        meta: { className: "w-32 text-right" },
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
        meta: { className: "w-12" },
        header: () => null,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const subscription = row.original.subscription;
          const busy = pendingId === subscription.id || bulkBusy;
          const stripeUrl = subscriptionStripeDashboardUrl(subscription.id);
          const showPause = canPauseSubscription(subscription);
          const showResume = Boolean(subscription.paymentCollectionPaused);
          const showCancel = canCancelSubscription(subscription);

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {stripeUrl ? (
                  <DropdownMenuItem asChild>
                    <a href={stripeUrl} target="_blank" rel="noopener noreferrer">
                      Open in Stripe
                    </a>
                  </DropdownMenuItem>
                ) : null}
                {showPause ? (
                  <DropdownMenuItem onClick={() => handlePause(subscription.id)}>Pause</DropdownMenuItem>
                ) : null}
                {showResume ? (
                  <DropdownMenuItem onClick={() => handleResume(subscription.id)}>Resume</DropdownMenuItem>
                ) : null}
                {showCancel ? (
                  <DropdownMenuItem onClick={() => handleCancel(row.original)}>Cancel</DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(row.original)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      }
    ],
    [pendingId, bulkBusy]
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

      <Card className="min-w-0 py-0">
        <CardContent className="space-y-2 px-6 pb-4 pt-4">
          <DataTable
            columns={columns}
            data={tableRows}
            tableClassName="table-fixed min-w-[1080px]"
            initialPageSize={25}
            initialSorting={[{ id: "createdAt", desc: true }]}
            initialColumnVisibility={{ searchLabel: false }}
            emptyMessage={rows.length === 0 ? "No subscriptions yet." : "No subscriptions match your filters."}
            toolbar={(table) => {
              tableRef.current = table;
              return (
                <SubscriptionListToolbar
                  table={table}
                  productOptions={productOptions}
                  onBulkDelete={handleBulkDelete}
                  bulkDeleteDisabled={bulkBusy}
                />
              );
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
