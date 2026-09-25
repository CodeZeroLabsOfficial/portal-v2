"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  Table as TanStackTable,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { DataTableFacetedFilter, type FacetedFilterOption } from "./data-table-faceted-filter";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";

export interface DataTableSearch {
  placeholder: string;
  columnId: string;
}

export interface DataTableFilter {
  columnId: string;
  title: string;
  options: FacetedFilterOption[];
}

export interface DataTableBulkAction<TData> {
  label: (count: number) => string;
  onAction: (table: TanStackTable<TData>) => void;
  disabled?: boolean;
  /** When the action applies to fewer rows than the selection (for example, only cancelable subscriptions). */
  count?: (table: TanStackTable<TData>) => number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  search?: DataTableSearch;
  filters?: DataTableFilter[];
  bulkAction?: DataTableBulkAction<TData>;
  /** Extra toolbar control, such as a date range picker. Hidden while a selection is active. */
  toolbarEnd?: React.ReactNode;
  /** Set when a filter lives outside column state, such as a date range. */
  externalFiltersActive?: boolean;
  /** Called together with clearing column filters. */
  onResetFilters?: () => void;
  emptyMessage?: React.ReactNode;
  initialPageSize?: number;
  initialSorting?: SortingState;
  initialColumnVisibility?: VisibilityState;
  tableClassName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  search,
  filters = [],
  bulkAction,
  toolbarEnd,
  externalFiltersActive = false,
  onResetFilters,
  emptyMessage = "No results.",
  initialPageSize = 25,
  initialSorting = [],
  initialColumnVisibility = {},
  tableClassName
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters
    },
    initialState: {
      pagination: {
        pageSize: initialPageSize
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  });

  const filterSignature = JSON.stringify(columnFilters);
  const tableRef = React.useRef(table);
  tableRef.current = table;
  const skipFilterPageReset = React.useRef(true);
  React.useEffect(() => {
    if (skipFilterPageReset.current) {
      skipFilterPageReset.current = false;
      return;
    }
    // A narrower filter can leave the current page past the end of the result set.
    tableRef.current.setPageIndex(0);
  }, [filterSignature]);

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const isSelecting = selectedCount > 0 && bulkAction != null;
  const actionCount = bulkAction?.count?.(table) ?? selectedCount;
  const showReset = columnFilters.length > 0 || externalFiltersActive;

  function handleReset() {
    table.resetColumnFilters();
    onResetFilters?.();
  }

  const columnsMenu = <DataTableViewOptions table={table} />;

  return (
    <Card className="min-w-0">
      <CardContent className="flex flex-col p-0 [&_[data-slot=table-container]]:flex-1">
        <div className="flex min-h-14 flex-wrap items-center gap-2 border-b px-(--card-spacing) py-3">
          {isSelecting && bulkAction ? (
            <>
              <span className="px-1 text-sm font-medium">{selectedCount} selected</span>
              <Button
                variant="destructive"
                size="sm"
                disabled={bulkAction.disabled || actionCount === 0}
                onClick={() => bulkAction.onAction(table)}>
                {bulkAction.label(actionCount)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ms-auto"
                onClick={() => table.resetRowSelection()}>
                Cancel
              </Button>
              {columnsMenu}
            </>
          ) : (
            <>
              {search ? (
                <div className="relative">
                  <Search className="text-muted-foreground absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2" />
                  <Input
                    placeholder={search.placeholder}
                    value={(table.getColumn(search.columnId)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                      table.getColumn(search.columnId)?.setFilterValue(event.target.value)
                    }
                    className="h-7 w-40 ps-8 text-[0.8rem] lg:w-56"
                  />
                </div>
              ) : null}
              {filters.map((filter) => {
                const column = table.getColumn(filter.columnId);
                if (!column) return null;
                return (
                  <DataTableFacetedFilter
                    key={filter.columnId}
                    column={column}
                    title={filter.title}
                    options={filter.options}
                  />
                );
              })}
              {showReset ? (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Reset
                  <X />
                </Button>
              ) : null}
              <div className="ms-auto flex items-center gap-2">
                {toolbarEnd}
                {columnsMenu}
              </div>
            </>
          )}
        </div>

        <Table
          className={cn(
            "[&_td:first-child]:ps-(--card-spacing) [&_td:last-child]:pe-(--card-spacing) [&_th:first-child]:ps-(--card-spacing) [&_th:last-child]:pe-(--card-spacing)",
            tableClassName
          )}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(header.column.columnDef.meta?.className)}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <DataTablePagination table={table} />
      </CardContent>
    </Card>
  );
}
