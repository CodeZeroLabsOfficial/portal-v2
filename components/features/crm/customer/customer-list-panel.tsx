"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef, Table } from "@tanstack/react-table";

import { AddCustomerDialog } from "@/components/features/crm/customer/add-customer-dialog";
import { CustomerEditSheet } from "@/components/features/crm/customer/customer-edit-sheet";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  customerCrmTypeBadgeDisplay,
  customerStatusBadgeDisplay,
  subscriptionRollupBadgeDisplay
} from "@/lib/crm/status-badges";
import type { CustomerListRow } from "@/lib/customer/list";
import { useSheetEntityState } from "@/hooks/use-sheet-entity-state";
import {
  archiveCustomerAction,
  deleteCustomerAction,
  getCustomerDetailAction
} from "@/server/actions/customers-crm";
import type { CustomerRecord } from "@/types/customer";

interface CustomerListPanelProps {
  rows: CustomerListRow[];
}

const CUSTOMER_STATUS_FILTER_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" }
];

const CUSTOMER_TYPE_FILTER_OPTIONS = [
  { label: "Lead", value: "lead" },
  { label: "Contact", value: "contact" }
];

export function CustomerListPanel({ rows }: CustomerListPanelProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);
  const customerEditSheet = useSheetEntityState<CustomerRecord>();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [editLoadingId, setEditLoadingId] = React.useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<(() => Promise<void>) | null>(null);
  const [confirmMeta, setConfirmMeta] = React.useState({ title: "", description: "" });

  React.useEffect(() => {
    router.refresh();
  }, [router]);

  async function openEdit(customerId: string) {
    setEditLoadingId(customerId);
    const res = await getCustomerDetailAction(customerId);
    setEditLoadingId(null);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    customerEditSheet.show(res.customer);
  }

  async function handleArchive(id: string, archived: boolean) {
    setPendingId(id);
    const res = await archiveCustomerAction(id, archived);
    setPendingId(null);
    if (res.ok) router.refresh();
  }

  async function handleDelete(id: string) {
    setConfirmMeta({
      title: "Delete customer",
      description:
        "Permanently delete this customer and all related records (proposals, opportunities, notes, etc.)? This cannot be undone."
    });
    setConfirmAction(() => async () => {
      setPendingId(id);
      const res = await deleteCustomerAction(id);
      setPendingId(null);
      if (!res.ok) throw new Error(res.message);
      router.refresh();
    });
    setConfirmOpen(true);
  }

  async function handleBulkDelete(table: Table<CustomerListRow>) {
    const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
    if (ids.length === 0) return;
    setConfirmMeta({
      title: `Delete ${ids.length} customer${ids.length === 1 ? "" : "s"}`,
      description: `Delete selected customers and all related records? This cannot be undone.`
    });
    setConfirmAction(() => async () => {
      setBulkBusy(true);
      for (const id of ids) {
        await deleteCustomerAction(id);
      }
      setBulkBusy(false);
      table.resetRowSelection();
      router.refresh();
    });
    setConfirmOpen(true);
  }

  const columns = React.useMemo<ColumnDef<CustomerListRow>[]>(
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
        meta: { viewLabel: "Name" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => (
          <Link
            href={`/admin/customers/${row.original.id}`}
            className="font-medium hover:underline">
            {row.original.name.trim() || row.original.email}
          </Link>
        ),
        filterFn: (row, _id, value) => {
          const q = String(value).toLowerCase();
          if (!q) return true;
          const r = row.original;
          const hay = [r.name, r.email, r.phone, r.location, r.company, r.tags.join(" ")]
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        }
      },
      {
        accessorKey: "status",
        meta: { viewLabel: "Status" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const d = customerStatusBadgeDisplay(row.original.status);
          return <StatusBadge label={d.label} variant={d.variant} />;
        },
        filterFn: (row, id, value) => {
          const filters = value as string[];
          return filters.includes(row.getValue(id));
        }
      },
      {
        accessorKey: "company",
        meta: { viewLabel: "Company" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
        cell: ({ row }) => {
          const company = row.original.company?.trim();
          if (!company) return <span className="text-muted-foreground">—</span>;
          if (row.original.accountId) {
            return (
              <Link href={`/admin/accounts/${row.original.accountId}`} className="hover:underline">
                {company}
              </Link>
            );
          }
          return company;
        }
      },
      {
        accessorKey: "email",
        meta: { viewLabel: "Email" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />
      },
      {
        accessorKey: "subscriptionRollup",
        meta: { viewLabel: "Subscriptions" },
        header: "Subscriptions",
        cell: ({ row }) => {
          const d = subscriptionRollupBadgeDisplay(row.original.subscriptionRollup);
          return <StatusBadge label={d.label} variant={d.variant} />;
        },
        enableSorting: false
      },
      {
        accessorKey: "crmType",
        meta: { viewLabel: "Type" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => {
          const d = customerCrmTypeBadgeDisplay(row.original.crmType);
          return <StatusBadge label={d.label} variant={d.variant} />;
        },
        filterFn: (row, id, value) => {
          const filters = value as string[];
          return filters.includes(row.getValue(id));
        }
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const id = row.original.id;
          const busy = pendingId === id || editLoadingId === id;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" disabled={busy}>
                  {editLoadingId === id ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <MoreHorizontal />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/customers/${id}`}>
                    <ExternalLink aria-hidden />
                    Open
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void openEdit(id)}>
                  <Pencil aria-hidden />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {row.original.status === "active" ? (
                  <DropdownMenuItem onClick={() => void handleArchive(id, true)}>
                    <Archive aria-hidden />
                    Archive
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => void handleArchive(id, false)}>
                    <ArchiveRestore aria-hidden />
                    Restore
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem variant="destructive" onClick={() => void handleDelete(id)}>
                  <Trash2 aria-hidden />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      }
    ],
    [pendingId, editLoadingId]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Leads and contacts across your pipeline"
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus />
            Add customer
          </Button>
        }
      />
      <AddCustomerDialog open={addOpen} onOpenChange={setAddOpen} />
      {customerEditSheet.entity ? (
        <CustomerEditSheet
          customer={customerEditSheet.entity}
          open={customerEditSheet.open}
          onOpenChange={customerEditSheet.onOpenChange}
        />
      ) : null}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmMeta.title}
        description={confirmMeta.description}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (confirmAction) await confirmAction();
        }}
      />
      <DataTable
        columns={columns}
        data={rows}
        emptyMessage="No customers yet. Add your first customer to get started."
        search={{ columnId: "name", placeholder: "Search name, email, company, tags…" }}
        filters={[
          { columnId: "status", title: "Status", options: CUSTOMER_STATUS_FILTER_OPTIONS },
          { columnId: "crmType", title: "Type", options: CUSTOMER_TYPE_FILTER_OPTIONS }
        ]}
        bulkAction={{
          label: (count) => `Delete (${count})`,
          disabled: bulkBusy,
          onAction: (table) => void handleBulkDelete(table)
        }}
      />
    </div>
  );
}
