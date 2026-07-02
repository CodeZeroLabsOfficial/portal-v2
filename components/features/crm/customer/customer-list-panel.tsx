"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MoreHorizontal, Plus, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import type { ColumnDef, Table } from "@tanstack/react-table";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormServerError } from "@/components/shared/form-server-error";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { DataTableFacetedFilter } from "@/components/shared/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/shared/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  CustomerProfileFormFields
} from "@/components/features/crm/customer/customer-profile-form-fields";
import { combineCustomerName } from "@/lib/customer/name-split";
import {
  EMPTY_CUSTOMER_PROFILE_FORM_VALUES,
  type CustomerProfileFormValues
} from "@/lib/customer/profile-form-values";
import { Input } from "@/components/ui/input";
import {
  customerCrmTypeBadgeDisplay,
  customerStatusBadgeDisplay,
  subscriptionRollupBadgeDisplay
} from "@/lib/crm/status-badges";
import type { CustomerListRow } from "@/lib/customer/list";
import { normalizeAddressFields } from "@/lib/common/format";
import { createCustomerSchema } from "@/lib/schemas/customer";
import {
  archiveCustomerAction,
  createCustomerAction,
  deleteCustomerAction
} from "@/server/actions/customers-crm";

interface CustomerListPanelProps {
  rows: CustomerListRow[];
}

const defaultValues: CustomerProfileFormValues = {
  ...EMPTY_CUSTOMER_PROFILE_FORM_VALUES
};

function CustomerToolbar({
  table,
  onBulkDelete,
  bulkDeleteDisabled
}: {
  table: Table<CustomerListRow>;
  onBulkDelete: () => void;
  bulkDeleteDisabled: boolean;
}) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Search name, email, company, tags…"
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
              { label: "Archived", value: "archived" }
            ]}
          />
        )}
        {table.getColumn("crmType") && (
          <DataTableFacetedFilter
            column={table.getColumn("crmType")}
            title="Type"
            options={[
              { label: "Lead", value: "lead" },
              { label: "Contact", value: "contact" }
            ]}
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

function AddCustomerDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [tagInput, setTagInput] = React.useState("");

  const form = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues
  });

  React.useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      setFirstName("");
      setLastName("");
      setTagInput("");
      setServerError(null);
    }
  }, [open, form]);

  React.useEffect(() => {
    form.setValue("name", combineCustomerName(firstName, lastName), {
      shouldValidate: true,
      shouldDirty: false
    });
  }, [firstName, lastName, form]);

  async function onSubmit(values: CustomerProfileFormValues) {
    setServerError(null);
    const tags = tagInput
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 20);
    const contactAddress = normalizeAddressFields({
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      city: values.city,
      region: values.region,
      postalCode: values.postalCode,
      country: values.country
    });
    const { id: _id, ...createPayload } = values;
    const result = await createCustomerAction({ ...createPayload, ...contactAddress, tags });
    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    onOpenChange(false);
    router.push(`/admin/customers/${result.customerId}`);
    router.refresh();
  }

  const busy = form.formState.isSubmitting;
  const profileForm = form;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>New customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col gap-4" noValidate>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <FormServerError message={serverError} />
            <CustomerProfileFormFields
              form={profileForm}
              mode="create"
              disabled={busy}
              firstName={firstName}
              lastName={lastName}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              tagInput={tagInput}
              onTagInputChange={setTagInput}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CustomerListPanel({ rows }: CustomerListPanelProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<(() => Promise<void>) | null>(null);
  const [confirmMeta, setConfirmMeta] = React.useState({ title: "", description: "" });
  const tableRef = React.useRef<Table<CustomerListRow> | null>(null);

  React.useEffect(() => {
    router.refresh();
  }, [router]);

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

  async function handleBulkDelete() {
    const table = tableRef.current;
    if (!table) return;
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
        cell: ({ row }) => {
          const company = row.original.company?.trim();
          if (!company) return <span className="text-muted-foreground">—</span>;
          if (row.original.accountKey) {
            return (
              <Link href={`/admin/accounts/${row.original.accountKey}`} className="hover:underline">
                {company}
              </Link>
            );
          }
          return company;
        }
      },
      {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />
      },
      {
        accessorKey: "subscriptionRollup",
        header: "Subscriptions",
        cell: ({ row }) => {
          const d = subscriptionRollupBadgeDisplay(row.original.subscriptionRollup);
          return <StatusBadge label={d.label} variant={d.variant} />;
        },
        enableSorting: false
      },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) =>
          row.original.tags.length > 0 ? (
            <span className="text-muted-foreground text-xs">{row.original.tags.join(", ")}</span>
          ) : (
            "—"
          ),
        enableSorting: false
      },
      {
        accessorKey: "crmType",
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
          const busy = pendingId === id;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" disabled={busy}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/customers/${id}`}>Open profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {row.original.status === "active" ? (
                  <DropdownMenuItem onClick={() => void handleArchive(id, true)}>
                    Archive
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => void handleArchive(id, false)}>
                    Restore
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => void handleDelete(id)}>
                  Delete
                </DropdownMenuItem>
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
        title="Customers"
        description="Unified hub for leads and contacts."
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus />
            Add customer
          </Button>
        }
      />
      <AddCustomerDialog open={addOpen} onOpenChange={setAddOpen} />
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
        toolbar={(table) => {
          tableRef.current = table;
          return (
            <CustomerToolbar
              table={table}
              onBulkDelete={() => void handleBulkDelete()}
              bulkDeleteDisabled={bulkBusy}
            />
          );
        }}
      />
    </div>
  );
}
