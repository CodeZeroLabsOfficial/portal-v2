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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { paymentStatusBadgeDisplay } from "@/lib/crm/payment-status-badge";
import type { PaymentRecord } from "@/types/payment";

interface RecentOrderRow {
  id: string;
  ref: string;
  stripeUrl: string;
  customerLabel: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
}

function shortRef(id: string): string {
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6);
  if (clean.length < 6) {
    return `#${id.slice(0, 8)}`;
  }
  return `#${clean.slice(0, 3)}-${clean.slice(3, 6)}`;
}

function stripePaymentDashboardUrl(payment: PaymentRecord): string {
  const id = payment.stripePaymentIntentId?.trim() || payment.id.trim();
  return `https://dashboard.stripe.com/payments/${encodeURIComponent(id)}`;
}

function initials(label: string): string {
  const parts = label.split(/[\s_]+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return `${first}${second}`.toUpperCase();
  }
  const compact = label.replace(/[^a-zA-Z0-9]/g, "");
  return compact.slice(0, 2).toUpperCase() || "—";
}

function toRecentOrderRow(payment: PaymentRecord): RecentOrderRow {
  const refId = payment.stripePaymentIntentId?.trim() || payment.id;
  return {
    id: refId,
    ref: shortRef(refId),
    stripeUrl: stripePaymentDashboardUrl(payment),
    customerLabel: payment.customerId.trim(),
    description: payment.description?.trim() ?? "",
    amount: payment.amount,
    currency: payment.currency || DEFAULT_CURRENCY,
    status: payment.status,
  };
}

const columns: ColumnDef<RecentOrderRow>[] = [
  {
    accessorKey: "ref",
    header: "ID",
    size: 90,
    cell: ({ row }) => (
      <Button variant="link" className="text-muted-foreground hover:text-primary h-auto p-0" asChild>
        <a href={row.original.stripeUrl} target="_blank" rel="noopener noreferrer">
          {row.original.ref}
        </a>
      </Button>
    ),
  },
  {
    accessorKey: "customerLabel",
    header: "Customer",
    cell: ({ row }) => {
      const label = row.original.customerLabel;
      if (!label) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>{initials(label)}</AvatarFallback>
          </Avatar>
          <div className="truncate font-medium">{label}</div>
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).toLowerCase();
      return (
        row.original.customerLabel.toLowerCase().includes(query) ||
        row.original.description.toLowerCase().includes(query)
      );
    },
  },
  {
    accessorKey: "description",
    header: "Product",
    size: 180,
    cell: ({ row }) => (
      <div className="text-muted-foreground truncate">{row.original.description || "—"}</div>
    ),
  },
  {
    accessorKey: "amount",
    size: 110,
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
      <div className="font-medium tabular-nums">
        {formatCurrencyAmount(row.original.amount, row.original.currency)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ row }) => {
      const status = paymentStatusBadgeDisplay(row.original.status);
      return <StatusBadge label={status.label} variant={status.variant} />;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    size: 56,
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
                void navigator.clipboard.writeText(row.original.id);
              }}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={row.original.stripeUrl} target="_blank" rel="noopener noreferrer">
                View payment details
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

interface AdminDashboardRecentTransactionsProps {
  payments: PaymentRecord[];
}

export function AdminDashboardRecentTransactions({
  payments,
}: AdminDashboardRecentTransactionsProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const rows = React.useMemo(
    () =>
      [...payments]
        .sort((a, b) => (b.createdAt || b.updatedAt) - (a.createdAt || a.updatedAt))
        .map(toRecentOrderRow),
    [payments],
  );

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
        <Table className="min-w-[760px] table-fixed [&_td:first-child]:ps-(--card-spacing) [&_td:last-child]:pe-(--card-spacing) [&_th:first-child]:ps-(--card-spacing) [&_th:last-child]:pe-(--card-spacing)">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
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
                  {payments.length === 0 ? "No payments recorded yet" : "No results."}
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
