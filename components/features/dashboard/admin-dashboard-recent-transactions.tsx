"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, FolderUp, MoreHorizontal } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_CURRENCY } from "@/config/constants";
import { formatCurrencyAmount } from "@/lib/common/format";
import { formatInvoiceDisplayLabel } from "@/lib/crm/customer-billing-metrics";
import { invoiceStatusBadgeDisplay } from "@/lib/crm/invoice-status-badge";
import { taskCustomerContactLabel } from "@/lib/customer/task-customer-label";
import type { CustomerRecord } from "@/types/customer";
import type { InvoiceRecord, InvoiceStatus } from "@/types/invoice";
import type { SubscriptionRecord } from "@/types/subscription";

interface RecentOrderRow {
  id: string;
  invoiceLabel: string;
  hostedInvoiceUrl: string;
  customerLabel: string;
  product: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
}

function customerLabelByStripeId(customers: CustomerRecord[]): Map<string, string> {
  const labels = new Map<string, string>();
  for (const customer of customers) {
    const stripeId = customer.stripeCustomerId?.trim();
    if (!stripeId || labels.has(stripeId)) continue;
    labels.set(stripeId, taskCustomerContactLabel(customer));
  }
  return labels;
}

function productNameBySubscriptionId(subscriptions: SubscriptionRecord[]): Map<string, string> {
  const names = new Map<string, string>();
  for (const subscription of subscriptions) {
    const name = subscription.productName?.trim();
    if (!name || names.has(subscription.id)) continue;
    names.set(subscription.id, name);
  }
  return names;
}

function toRecentOrderRow(
  invoice: InvoiceRecord,
  customerLabels: Map<string, string>,
  productNames: Map<string, string>,
): RecentOrderRow {
  const subscriptionId = invoice.subscriptionId?.trim() ?? "";
  return {
    id: invoice.stripeInvoiceId || invoice.id,
    invoiceLabel: formatInvoiceDisplayLabel(invoice),
    hostedInvoiceUrl: invoice.hostedInvoiceUrl?.trim() ?? "",
    customerLabel: customerLabels.get(invoice.customerId.trim()) ?? "",
    product: subscriptionId ? (productNames.get(subscriptionId) ?? "") : "",
    amount: invoice.amountDue,
    currency: invoice.currency || DEFAULT_CURRENCY,
    status: invoice.status,
  };
}

const columns: ColumnDef<RecentOrderRow>[] = [
  {
    accessorKey: "invoiceLabel",
    header: "ID",
    cell: ({ row }) => {
      const label = row.original.invoiceLabel;
      const href = row.original.hostedInvoiceUrl;
      if (!href) {
        return <span className="text-muted-foreground whitespace-nowrap">{label}</span>;
      }
      return (
        <Button variant="link" className="text-muted-foreground hover:text-primary h-auto p-0" asChild>
          <a href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        </Button>
      );
    },
  },
  {
    accessorKey: "customerLabel",
    header: "Customer",
    cell: ({ row }) => {
      const label = row.original.customerLabel;
      if (!label) {
        return <span className="text-muted-foreground">—</span>;
      }
      return <div className="font-medium">{label}</div>;
    },
    filterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).toLowerCase();
      return (
        row.original.customerLabel.toLowerCase().includes(query) ||
        row.original.product.toLowerCase().includes(query) ||
        row.original.invoiceLabel.toLowerCase().includes(query)
      );
    },
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.original.product || "—"}</div>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="h-8 px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Amount
        <ArrowUpDown className="size-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium whitespace-nowrap tabular-nums">
        {formatCurrencyAmount(row.original.amount, row.original.currency)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = invoiceStatusBadgeDisplay(row.original.status);
      return <StatusBadge label={status.label} variant={status.variant} />;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                void navigator.clipboard.writeText(row.original.invoiceLabel);
              }}
            >
              Copy invoice number
            </DropdownMenuItem>
            {row.original.hostedInvoiceUrl ? (
              <DropdownMenuItem asChild>
                <a href={row.original.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer">
                  View invoice
                </a>
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

interface AdminDashboardRecentTransactionsProps {
  invoices: InvoiceRecord[];
  customers: CustomerRecord[];
  subscriptions: SubscriptionRecord[];
}

export function AdminDashboardRecentTransactions({
  invoices,
  customers,
  subscriptions,
}: AdminDashboardRecentTransactionsProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const rows = React.useMemo(() => {
    const customerLabels = customerLabelByStripeId(customers);
    const productNames = productNameBySubscriptionId(subscriptions);
    return [...invoices]
      .sort((a, b) => (b.issuedAt || b.paidAt || 0) - (a.issuedAt || a.paidAt || 0))
      .map((invoice) => toRecentOrderRow(invoice, customerLabels, productNames));
  }, [invoices, customers, subscriptions]);

  const table = useReactTable({
    data: rows,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 8,
      },
    },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const rowCount = table.getFilteredRowModel().rows.length;
  const firstRow = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, rowCount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FolderUp />
                <span className="hidden lg:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>Excel</DropdownMenuItem>
              <DropdownMenuItem disabled>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col p-0 [&_[data-slot=table-container]]:flex-1">
        <div className="flex min-h-14 items-center gap-2 border-b px-(--card-spacing) py-3">
          <Input
            placeholder="Filter orders..."
            value={(table.getColumn("customerLabel")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("customerLabel")?.setFilterValue(event.target.value)}
            className="max-w-xs"
          />
        </div>
        <Table className="[&_td:first-child]:ps-(--card-spacing) [&_td:last-child]:pe-(--card-spacing) [&_th:first-child]:ps-(--card-spacing) [&_th:last-child]:pe-(--card-spacing)">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {invoices.length === 0 ? "No invoices recorded yet" : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between gap-2 border-t px-(--card-spacing) py-3">
          <p className="text-muted-foreground text-sm tabular-nums">
            {firstRow} - {lastRow} of {rowCount} orders
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Next page</span>
              <ChevronRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
