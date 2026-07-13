"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef, Table } from "@tanstack/react-table";

import { AccountEditSheet } from "@/components/features/crm/account/account-edit-sheet";
import { AddAccountDialog } from "@/components/features/crm/account/add-account-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { DataTableViewOptions } from "@/components/shared/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useSheetEntityState } from "@/hooks/use-sheet-entity-state";
import type { AccountListRow } from "@/lib/account/list";
import {
  deleteAccountAction,
  getAccountDetailAction,
} from "@/server/actions/accounts-crm";
import type { AccountDetailAggregate } from "@/types/account";

interface AccountListPanelProps {
  rows: AccountListRow[];
}

function contactCountForRow(row: AccountListRow): number {
  const hasPrimary = Boolean(row.contactName.trim() || row.contactId);
  return (hasPrimary ? 1 : 0) + row.additionalContactCount;
}

function AccountToolbar({
  table,
  onBulkDelete,
  bulkDeleteDisabled,
}: {
  table: Table<AccountListRow>;
  onBulkDelete: () => void;
  bulkDeleteDisabled: boolean;
}) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Search company, contact, address, email…"
          value={(table.getColumn("displayName")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("displayName")?.setFilterValue(e.target.value)}
          className="h-8 w-full sm:max-w-xs"
        />
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {selectedCount > 0 ? (
          <Button
            variant="destructive"
            size="sm"
            disabled={bulkDeleteDisabled}
            onClick={onBulkDelete}>
            <Trash2 />
            Delete ({selectedCount})
          </Button>
        ) : null}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}

export function AccountListPanel({ rows }: AccountListPanelProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);
  const accountEditSheet = useSheetEntityState<AccountDetailAggregate>();
  const [editLoadingId, setEditLoadingId] = React.useState<string | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<(() => Promise<void>) | null>(null);
  const [confirmMeta, setConfirmMeta] = React.useState({ title: "", description: "" });
  const tableRef = React.useRef<Table<AccountListRow> | null>(null);

  React.useEffect(() => {
    router.refresh();
  }, [router]);

  async function openEdit(accountId: string) {
    setEditLoadingId(accountId);
    const res = await getAccountDetailAction(accountId);
    setEditLoadingId(null);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    accountEditSheet.show(res.account);
  }

  function handleDelete(row: AccountListRow) {
    const contactCount = contactCountForRow(row);
    setConfirmMeta({
      title: "Delete account",
      description:
        contactCount > 0
          ? `Permanently delete ${row.displayName} and its ${contactCount} contact${contactCount === 1 ? "" : "s"}, including documents, proposals, opportunities, notes, tasks, invoices, and subscriptions? Open Stripe subscriptions must be canceled first. This cannot be undone.`
          : `Permanently delete ${row.displayName}? Related billing mirrors and documents (if any) will also be removed. This cannot be undone.`,
    });
    setConfirmAction(() => async () => {
      setPendingId(row.id);
      const res = await deleteAccountAction(row.id);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.message);
        throw new Error(res.message);
      }
      toast.success("Account deleted");
      router.refresh();
    });
    setConfirmOpen(true);
  }

  function handleBulkDelete() {
    const table = tableRef.current;
    if (!table) return;
    const selected = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
    if (selected.length === 0) return;
    setConfirmMeta({
      title: `Delete ${selected.length} account${selected.length === 1 ? "" : "s"}`,
      description:
        "Permanently delete the selected accounts and all linked contacts, including documents, proposals, opportunities, notes, tasks, invoices, and subscriptions? Open Stripe subscriptions must be canceled first. This cannot be undone.",
    });
    setConfirmAction(() => async () => {
      setBulkBusy(true);
      let failed = 0;
      for (const row of selected) {
        const res = await deleteAccountAction(row.id);
        if (!res.ok) {
          failed += 1;
          toast.error(`${row.displayName}: ${res.message}`);
        }
      }
      setBulkBusy(false);
      table.resetRowSelection();
      if (failed === 0) toast.success("Accounts deleted");
      router.refresh();
    });
    setConfirmOpen(true);
  }

  const columns = React.useMemo<ColumnDef<AccountListRow>[]>(
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
        enableHiding: false,
      },
      {
        accessorKey: "displayName",
        meta: { viewLabel: "Company" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
        cell: ({ row }) => (
          <Link
            href={`/admin/accounts/${row.original.id}`}
            className="font-medium hover:underline">
            {row.original.displayName}
          </Link>
        ),
        filterFn: (row, _id, value) => {
          const q = String(value).toLowerCase();
          if (!q) return true;
          const r = row.original;
          const hay = [
            r.displayName,
            r.contactName,
            r.addressSummary,
            r.companyPhone,
            r.companyEmail,
            r.companyWebsite,
          ]
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        },
      },
      {
        accessorKey: "contactName",
        meta: { viewLabel: "Contact" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
        cell: ({ row }) => {
          const name = row.original.contactName.trim();
          if (!name) return <span className="text-muted-foreground">—</span>;
          return (
            <span className="inline-flex min-w-0 items-baseline gap-1">
              {row.original.contactId ? (
                <Link
                  href={`/admin/customers/${row.original.contactId}`}
                  className="truncate font-medium hover:underline">
                  {name}
                </Link>
              ) : (
                <span className="truncate">{name}</span>
              )}
              {row.original.additionalContactCount > 0 ? (
                <span className="text-muted-foreground shrink-0 text-xs">
                  +{row.original.additionalContactCount}
                </span>
              ) : null}
            </span>
          );
        },
      },
      {
        accessorKey: "addressSummary",
        meta: { viewLabel: "Address" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Address" />,
        cell: ({ row }) => {
          const summary = row.original.addressSummary.trim();
          return summary ? (
            <span className="line-clamp-2">{summary}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "companyPhone",
        meta: { viewLabel: "Phone" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
        cell: ({ row }) => {
          const phone = row.original.companyPhone.trim();
          return phone || <span className="text-muted-foreground">—</span>;
        },
      },
      {
        accessorKey: "companyEmail",
        meta: { viewLabel: "Email" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => {
          const email = row.original.companyEmail.trim();
          return email || <span className="text-muted-foreground">—</span>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const id = row.original.id;
          const busy = editLoadingId === id || pendingId === id;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" disabled={busy}>
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <MoreHorizontal />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/accounts/${id}`}>
                    <ExternalLink aria-hidden />
                    Open
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void openEdit(id)}>
                  <Pencil aria-hidden />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDelete(row.original)}>
                  <Trash2 aria-hidden />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [editLoadingId, pendingId],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        description="Company profiles. Link contacts to an account from the customer form."
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus />
            Add account
          </Button>
        }
      />
      <AddAccountDialog open={addOpen} onOpenChange={setAddOpen} />
      {accountEditSheet.entity ? (
        <AccountEditSheet
          account={accountEditSheet.entity}
          open={accountEditSheet.open}
          onOpenChange={accountEditSheet.onOpenChange}
        />
      ) : null}
      <DataTable
        columns={columns}
        data={rows}
        emptyMessage="No accounts yet. Add an account to get started."
        toolbar={(table) => {
          tableRef.current = table;
          return (
            <AccountToolbar
              table={table}
              onBulkDelete={handleBulkDelete}
              bulkDeleteDisabled={bulkBusy}
            />
          );
        }}
      />
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
    </div>
  );
}
