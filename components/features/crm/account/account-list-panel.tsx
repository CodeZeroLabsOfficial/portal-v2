"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal, Plus, X } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef, Table } from "@tanstack/react-table";

import { AccountEditSheet } from "@/components/features/crm/account/account-edit-sheet";
import { AddAccountDialog } from "@/components/features/crm/account/add-account-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { DataTableViewOptions } from "@/components/shared/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useSheetEntityState } from "@/hooks/use-sheet-entity-state";
import type { AccountListRow } from "@/lib/account/list";
import { getAccountDetailAction } from "@/server/actions/accounts-crm";
import type { AccountDetailAggregate } from "@/server/firestore/crm-customers";

interface AccountEditPayload {
  account: AccountDetailAggregate;
  accountKey: string;
}

interface AccountListPanelProps {
  rows: AccountListRow[];
}

function AccountToolbar({ table }: { table: Table<AccountListRow> }) {
  const isFiltered = table.getState().columnFilters.length > 0;

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
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}

export function AccountListPanel({ rows }: AccountListPanelProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);
  const accountEditSheet = useSheetEntityState<AccountEditPayload>();
  const [editLoadingKey, setEditLoadingKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    router.refresh();
  }, [router]);

  async function openEdit(accountKey: string) {
    setEditLoadingKey(accountKey);
    const res = await getAccountDetailAction(accountKey);
    setEditLoadingKey(null);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    accountEditSheet.show({ account: res.account, accountKey: res.accountKey });
  }

  const columns = React.useMemo<ColumnDef<AccountListRow>[]>(
    () => [
      {
        accessorKey: "displayName",
        meta: { viewLabel: "Company" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
        cell: ({ row }) => (
          <Link
            href={`/admin/accounts/${row.original.key}`}
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
            r.companyWebsite
          ]
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        }
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
        }
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
        }
      },
      {
        accessorKey: "companyPhone",
        meta: { viewLabel: "Phone" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
        cell: ({ row }) => {
          const phone = row.original.companyPhone.trim();
          return phone || <span className="text-muted-foreground">—</span>;
        }
      },
      {
        accessorKey: "companyEmail",
        meta: { viewLabel: "Email" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => {
          const email = row.original.companyEmail.trim();
          return email || <span className="text-muted-foreground">—</span>;
        }
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const key = row.original.key;
          const busy = editLoadingKey === key;
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
                  <Link href={`/admin/accounts/${key}`}>View Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void openEdit(key)}>Edit</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      }
    ],
    [editLoadingKey]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        description="Company profiles from customer records. Set company details when editing a customer."
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
          account={accountEditSheet.entity.account}
          accountKey={accountEditSheet.entity.accountKey}
          open={accountEditSheet.open}
          onOpenChange={accountEditSheet.onOpenChange}
        />
      ) : null}
      <DataTable
        columns={columns}
        data={rows}
        emptyMessage="No accounts yet. Add a company name on a customer profile to see it listed here."
        toolbar={(table) => <AccountToolbar table={table} />}
      />
    </div>
  );
}
