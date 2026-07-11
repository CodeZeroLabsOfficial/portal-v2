"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal, Plus, Trash2, X } from "lucide-react";
import type { ColumnDef, Table } from "@tanstack/react-table";

import { AddCatalogServiceDialog } from "@/components/features/catalog/add-catalog-service-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { DataTableFacetedFilter } from "@/components/shared/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/shared/data-table/data-table-view-options";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCatalogCategories } from "@/hooks/use-catalog-categories";
import { catalogCategoryLabel } from "@/lib/catalog/categories";
import { catalogPricingLabel, formatCatalogTableDate } from "@/lib/catalog/display";
import {
  catalogServiceKindBadgeDisplay,
  catalogServiceStatusBadgeDisplay,
  catalogStripeSyncBadgeDisplay
} from "@/lib/catalog/status-badges";
import {
  archiveCatalogServiceAction,
  deleteCatalogServiceAction,
} from "@/server/actions/catalog-services";
import type { CatalogServiceRecord } from "@/types/catalog-service";

interface CatalogServicesListPanelProps {
  services: CatalogServiceRecord[];
}

function CatalogServicesToolbar({
  table,
  onBulkDelete,
  bulkDeleteDisabled,
  categoryOptions,
}: {
  table: Table<CatalogServiceRecord>;
  onBulkDelete: () => void;
  bulkDeleteDisabled: boolean;
  categoryOptions: { label: string; value: string }[];
}) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Search name, slug, Stripe id…"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
          className="h-8 w-full sm:max-w-xs"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={[
              { label: "Active", value: "active" },
              { label: "Draft", value: "draft" },
              { label: "Archived", value: "archived" }
            ]}
          />
        )}
        {table.getColumn("serviceType") && (
          <DataTableFacetedFilter
            column={table.getColumn("serviceType")}
            title="Type"
            options={[
              { label: "Plan", value: "plan" },
              { label: "Add-on", value: "addon" }
            ]}
          />
        )}
        {table.getColumn("category") && categoryOptions.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn("category")}
            title="Category"
            options={categoryOptions}
          />
        )}
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <Button variant="destructive" size="sm" disabled={bulkDeleteDisabled} onClick={onBulkDelete}>
            <Trash2 />
            Delete ({selectedCount})
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}

export function CatalogServicesListPanel({ services }: CatalogServicesListPanelProps) {
  const router = useRouter();
  const { categories } = useCatalogCategories();
  const categoryOptions = React.useMemo(
    () => categories.map((c) => ({ label: c.label, value: c.id })),
    [categories],
  );
  const [addOpen, setAddOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<(() => Promise<void>) | null>(null);
  const [confirmMeta, setConfirmMeta] = React.useState({
    title: "",
    description: "",
    confirmLabel: "Continue",
    destructive: false
  });
  const tableRef = React.useRef<Table<CatalogServiceRecord> | null>(null);

  React.useEffect(() => {
    router.refresh();
  }, [router]);

  function openConfirm(opts: {
    title: string;
    description: string;
    confirmLabel?: string;
    destructive?: boolean;
    action: () => Promise<void>;
  }) {
    setConfirmMeta({
      title: opts.title,
      description: opts.description,
      confirmLabel: opts.confirmLabel ?? "Continue",
      destructive: opts.destructive ?? false
    });
    setConfirmAction(() => opts.action);
    setConfirmOpen(true);
  }

  function handleArchive(id: string) {
    openConfirm({
      title: "Archive service",
      description:
        "Archive this service? It will be hidden from new proposals and subscriptions.",
      confirmLabel: "Archive",
      action: async () => {
        setPendingId(id);
        const res = await archiveCatalogServiceAction(id);
        setPendingId(null);
        if (!res.ok) throw new Error(res.message);
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    openConfirm({
      title: "Delete service",
      description:
        "Delete this service permanently? It will be removed from the catalogue. Linked Stripe product will be deactivated if present; existing subscriptions are not changed.",
      confirmLabel: "Delete",
      destructive: true,
      action: async () => {
        setPendingId(id);
        const res = await deleteCatalogServiceAction(id);
        setPendingId(null);
        if (!res.ok) throw new Error(res.message);
        router.refresh();
      }
    });
  }

  function handleBulkDelete() {
    const table = tableRef.current;
    if (!table) return;
    const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
    if (ids.length === 0) return;
    openConfirm({
      title: `Delete ${ids.length} service${ids.length === 1 ? "" : "s"}`,
      description:
        "Delete selected services permanently? Linked Stripe products will be deactivated if present.",
      confirmLabel: "Delete",
      destructive: true,
      action: async () => {
        setBulkBusy(true);
        const failed: string[] = [];
        for (const id of ids) {
          const res = await deleteCatalogServiceAction(id);
          if (!res.ok) failed.push(id);
        }
        setBulkBusy(false);
        if (failed.length > 0) {
          throw new Error(`Deleted ${ids.length - failed.length} of ${ids.length}. ${failed.length} failed.`);
        }
        table.resetRowSelection();
        router.refresh();
      }
    });
  }

  const columns = React.useMemo<ColumnDef<CatalogServiceRecord>[]>(
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
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false
      },
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Service name" />,
        cell: ({ row }) => (
          <Link href={`/admin/services/${row.original.id}`} className="font-medium hover:underline">
            {row.original.name}
          </Link>
        ),
        filterFn: (row, _id, value) => {
          const q = String(value).toLowerCase();
          if (!q) return true;
          const s = row.original;
          const hay = [
            s.name,
            s.slug,
            s.category,
            catalogCategoryLabel(s.category, categories),
            s.serviceType,
            s.status,
            s.stripeProductId,
            s.currency,
            String(s.includedUsers),
            String(s.includedLocations)
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        }
      },
      {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {catalogCategoryLabel(row.original.category, categories)}
          </span>
        ),
        filterFn: (row, id, value) => {
          const filters = value as string[];
          return filters.includes(row.getValue(id));
        }
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const d = catalogServiceStatusBadgeDisplay(row.original.status);
          return <StatusBadge label={d.label} variant={d.variant} />;
        },
        filterFn: (row, id, value) => {
          const filters = value as string[];
          return filters.includes(row.getValue(id));
        }
      },
      {
        accessorKey: "serviceType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => {
          const d = catalogServiceKindBadgeDisplay(row.original.serviceType);
          return <StatusBadge label={d.label} variant={d.variant} />;
        },
        filterFn: (row, id, value) => {
          const filters = value as string[];
          const cell = row.getValue(id) as string | undefined;
          return cell ? filters.includes(cell) : false;
        }
      },
      {
        id: "pricing",
        header: "Pricing",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {catalogPricingLabel(row.original)}
          </span>
        ),
        enableSorting: false
      },
      {
        id: "stripe",
        header: "Stripe",
        cell: ({ row }) => {
          const d = catalogStripeSyncBadgeDisplay(
            row.original.stripeProductId,
            row.original.stripeSyncedAt
          );
          return <StatusBadge label={d.label} variant={d.variant} />;
        },
        enableSorting: false
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground">{formatCatalogTableDate(row.original.updatedAt)}</span>
        )
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const service = row.original;
          const id = service.id;
          const busy = pendingId === id;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/services/${id}`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {service.status !== "archived" ? (
                  <DropdownMenuItem onClick={() => handleArchive(id)}>Archive</DropdownMenuItem>
                ) : null}
                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      }
    ],
    [pendingId, categories]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Product catalogue synced to Stripe."
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus />
            Add service
          </Button>
        }
      />
      <AddCatalogServiceDialog open={addOpen} onOpenChange={setAddOpen} />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmMeta.title}
        description={confirmMeta.description}
        confirmLabel={confirmMeta.confirmLabel}
        destructive={confirmMeta.destructive}
        onConfirm={async () => {
          if (confirmAction) await confirmAction();
        }}
      />
      <DataTable
        columns={columns}
        data={services}
        emptyMessage="No services yet. Add your first service to get started."
        toolbar={(table) => {
          tableRef.current = table;
          return (
            <CatalogServicesToolbar
              table={table}
              onBulkDelete={() => handleBulkDelete()}
              bulkDeleteDisabled={bulkBusy}
              categoryOptions={categoryOptions}
            />
          );
        }}
      />
    </div>
  );
}
