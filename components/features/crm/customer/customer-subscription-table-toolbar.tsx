"use client";

import type { Table } from "@tanstack/react-table";
import type { DateRange } from "react-day-picker";
import { X } from "lucide-react";

import CalendarDateRangePicker from "@/components/custom-date-range-picker";
import { DataTableFacetedFilter } from "@/components/shared/data-table/data-table-faceted-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  SUBSCRIPTION_STATUS_FILTER_OPTIONS,
  type SubscriptionTableRow
} from "@/lib/crm/subscription-table";

export interface CustomerSubscriptionTableToolbarProps {
  table: Table<SubscriptionTableRow>;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function CustomerSubscriptionTableToolbar({
  table,
  dateRange,
  onDateRangeChange,
  className
}: CustomerSubscriptionTableToolbarProps) {
  const isColumnFiltered = table.getState().columnFilters.length > 0;
  const isDateFiltered = Boolean(dateRange?.from);
  const showReset = isColumnFiltered || isDateFiltered;

  return (
    <div
      className={cn(
        "flex min-w-0 w-full flex-wrap items-center gap-2 py-2",
        className
      )}>
      <Input
        placeholder="Search subscriptions…"
        value={(table.getColumn("searchLabel")?.getFilterValue() as string) ?? ""}
        onChange={(event) => table.getColumn("searchLabel")?.setFilterValue(event.target.value)}
        className="h-8 min-w-0 flex-1 sm:max-w-xs"
      />
      {table.getColumn("status") ? (
        <DataTableFacetedFilter
          column={table.getColumn("status")}
          title="Status"
          options={SUBSCRIPTION_STATUS_FILTER_OPTIONS}
        />
      ) : null}
      <CalendarDateRangePicker
        value={dateRange}
        onChange={onDateRangeChange}
        className="shrink-0"
      />
      {showReset ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => {
            table.resetColumnFilters();
            onDateRangeChange(undefined);
          }}>
          Reset
          <X className="size-4" aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}
