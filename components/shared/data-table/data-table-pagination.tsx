import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

/** Current page plus neighbors, capped so long lists do not render a button per page. */
function visiblePageIndexes(pageIndex: number, pageCount: number): number[] {
  if (pageCount <= 0) return [];
  const windowSize = 5;
  let start = Math.max(0, pageIndex - 2);
  let end = Math.min(pageCount, start + windowSize);
  start = Math.max(0, end - windowSize);
  return Array.from({ length: end - start }, (_, index) => start + index);
}

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const rowCount = table.getFilteredRowModel().rows.length;
  const firstRow = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, rowCount);
  const pages = visiblePageIndexes(pageIndex, pageCount);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-(--card-spacing) py-3 sm:flex-row">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        Rows per page
        <Select value={String(pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
          <SelectTrigger size="sm" className="w-fit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-sm tabular-nums">
          {firstRow} - {lastRow} of {rowCount}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">Previous page</span>
            <ChevronLeft />
          </Button>
          {pages.map((index) => (
            <Button
              key={index}
              variant={index === pageIndex ? "outline" : "ghost"}
              size="icon-sm"
              className="tabular-nums"
              onClick={() => table.setPageIndex(index)}>
              {index + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            <span className="sr-only">Next page</span>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
