"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Trash2, X } from "lucide-react";

import { DataTableViewOptions } from "@/components/shared/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";

export interface DataTableBulkToolbarProps<TData> {
  table: Table<TData>;
  /** Primary filters and search — rendered on the left. */
  filters?: React.ReactNode;
  selectedCount?: number;
  onBulkDelete?: () => void;
  bulkDeleteDisabled?: boolean;
  bulkDeleteLabel?: (count: number) => string;
  showViewOptions?: boolean;
  onResetFilters?: () => void;
  isFiltered?: boolean;
}

/** Shared bulk-selection + view-options row for hub DataTables. */
export function DataTableBulkToolbar<TData>({
  table,
  filters,
  selectedCount: selectedCountProp,
  onBulkDelete,
  bulkDeleteDisabled = false,
  bulkDeleteLabel = (count) => `Delete (${count})`,
  showViewOptions = true,
  onResetFilters,
  isFiltered: isFilteredProp,
}: DataTableBulkToolbarProps<TData>) {
  const selectedCount =
    selectedCountProp ?? table.getFilteredSelectedRowModel().rows.length;
  const isFiltered =
    isFilteredProp ?? table.getState().columnFilters.length > 0;

  function handleReset() {
    if (onResetFilters) onResetFilters();
    else table.resetColumnFilters();
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {filters}
        {isFiltered ? (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
            <X />
          </Button>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {selectedCount > 0 && onBulkDelete ? (
          <Button
            variant="destructive"
            size="sm"
            disabled={bulkDeleteDisabled}
            onClick={onBulkDelete}
          >
            <Trash2 />
            {bulkDeleteLabel(selectedCount)}
          </Button>
        ) : null}
        {showViewOptions ? <DataTableViewOptions table={table} /> : null}
      </div>
    </div>
  );
}
