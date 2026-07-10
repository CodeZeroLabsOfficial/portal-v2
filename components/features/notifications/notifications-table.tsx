"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Columns,
  FileText,
  FilterIcon,
} from "lucide-react";

import { NotificationVisual } from "@/components/features/notifications/notification-visual";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  formatNotificationDateTime,
  notificationCategoryLabel,
  notificationDisplayActor,
  notificationDisplayMessage,
  notificationDisplayTitle,
} from "@/lib/notification/format";
import { cn } from "@/lib/utils";
import type { NotificationRecord } from "@/types/notification";

const CATEGORY_FILTER_OPTIONS = [
  { value: "crm", label: "CRM" },
  { value: "proposal", label: "Proposal" },
  { value: "billing", label: "Billing" },
  { value: "subscription", label: "Subscription" },
  { value: "task", label: "Task" },
  { value: "system", label: "System" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

function ColumnFilterPopover({
  title,
  options,
  selected,
  onToggle,
  triggerClassName,
}: {
  title: string;
  options: { value: string; label: string }[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  triggerClassName?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={triggerClassName}>
          {title}
          {selected.size > 0 ? ` (${selected.size})` : null}
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0">
        <Command>
          <CommandInput placeholder="Filter" className="h-9" />
          <CommandList>
            <CommandEmpty>No filter found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => onToggle(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      selected.has(option.value) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function toggleFilterValue(current: string[] | undefined, value: string): string[] {
  const selected = new Set(current ?? []);
  if (selected.has(value)) selected.delete(value);
  else selected.add(value);
  return Array.from(selected);
}

export interface NotificationsTableProps {
  data: NotificationRecord[];
  onOpen: (notification: NotificationRecord) => void;
}

export function NotificationsTable({ data, onOpen }: NotificationsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    status: false,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo<ColumnDef<NotificationRecord>[]>(
    () => [
      {
        id: "notification",
        accessorFn: (row) => notificationDisplayTitle(row),
        header: "Notification",
        cell: ({ row }) => {
          const n = row.original;
          const unread = n.readAt == null;
          const title = notificationDisplayTitle(n);
          const message = notificationDisplayMessage(n);
          const actor = notificationDisplayActor(n);
          return (
            <button
              type="button"
              className="w-full rounded-md p-2 text-left"
              onClick={() => onOpen(n)}
            >
              <div className="flex gap-4">
                <NotificationVisual notification={n} />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className={cn("text-sm", unread ? "font-semibold" : "font-medium")}>
                    {title}
                  </div>
                  {message ? (
                    <div className="text-muted-foreground text-sm">{message}</div>
                  ) : null}
                  <div className="text-muted-foreground text-xs">By {actor}</div>
                </div>
              </div>
            </button>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <div className="capitalize">{notificationCategoryLabel(row.original.category)}</div>
        ),
        filterFn: (row, id, value) => {
          const selected = value as string[];
          if (!selected?.length) return true;
          return selected.includes(row.getValue(id) as string);
        },
      },
      {
        id: "status",
        accessorFn: (row) => (row.readAt == null ? "unread" : "read"),
        header: "Status",
        cell: () => null,
        filterFn: (row, id, value) => {
          const selected = value as string[];
          if (!selected?.length) return true;
          return selected.includes(row.getValue(id) as string);
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            className="-ml-3"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Time
            <ArrowUpDown className="size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground whitespace-nowrap text-sm">
            {formatNotificationDateTime(row.original.createdAt)}
          </span>
        ),
      },
    ],
    [onOpen],
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase().trim();
      if (!search) return true;
      const n = row.original;
      const haystack = [
        notificationDisplayTitle(n),
        notificationDisplayMessage(n),
        notificationDisplayActor(n),
        notificationCategoryLabel(n.category),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  const statusSelected = new Set(
    (table.getColumn("status")?.getFilterValue() as string[] | undefined) ?? [],
  );
  const categorySelected = new Set(
    (table.getColumn("category")?.getFilterValue() as string[] | undefined) ?? [],
  );

  function handleStatusToggle(value: string) {
    const column = table.getColumn("status");
    if (!column) return;
    column.setFilterValue(
      toggleFilterValue(column.getFilterValue() as string[] | undefined, value),
    );
  }

  function handleCategoryToggle(value: string) {
    const column = table.getColumn("category");
    if (!column) return;
    column.setFilterValue(
      toggleFilterValue(column.getFilterValue() as string[] | undefined, value),
    );
  }

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const rangeStart = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const rangeEnd = Math.min((pageIndex + 1) * pageSize, filteredCount);

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Input
          placeholder="Search notifications…"
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="grow"
        />
        <div className="hidden gap-2 md:flex">
          <ColumnFilterPopover
            title="Status"
            options={STATUS_FILTER_OPTIONS}
            selected={statusSelected}
            onToggle={handleStatusToggle}
          />
          <ColumnFilterPopover
            title="Category"
            options={CATEGORY_FILTER_OPTIONS}
            selected={categorySelected}
            onToggle={handleCategoryToggle}
          />
        </div>
        <div className="inline md:hidden">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <FilterIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-4">
              <div className="grid space-y-2">
                <ColumnFilterPopover
                  title="Status"
                  options={STATUS_FILTER_OPTIONS}
                  selected={statusSelected}
                  onToggle={handleStatusToggle}
                  triggerClassName="w-full justify-start"
                />
                <ColumnFilterPopover
                  title="Category"
                  options={CATEGORY_FILTER_OPTIONS}
                  selected={categorySelected}
                  onToggle={handleCategoryToggle}
                  triggerClassName="w-full justify-start"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="ms-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => {
                  const isUnread = row.original.readAt == null;
                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        isUnread &&
                          "border-l border-l-amber-500 bg-orange-50! dark:bg-amber-950/50!",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 py-4">
                      <FileText className="text-muted-foreground size-8" />
                      <p className="text-muted-foreground text-sm">No notifications yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <div className="text-muted-foreground flex-1 text-sm">
            Showing {rangeStart} to {rangeEnd} of {filteredCount} notification(s)
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
