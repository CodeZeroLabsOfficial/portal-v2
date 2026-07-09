"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef, Table as TanStackTable } from "@tanstack/react-table";
import { Check, FileText, Settings, Users } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { DataTableFacetedFilter } from "@/components/shared/data-table/data-table-faceted-filter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatNotificationTime,
  formatNotificationTitle,
  notificationCategoryLabel,
} from "@/lib/notification/format";
import { cn } from "@/lib/utils";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/server/actions/notifications";
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

function actorInitials(name?: string): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
}

function NotificationsToolbar({
  table,
}: {
  table: TanStackTable<NotificationRecord>;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Search notifications…"
          value={(table.getColumn("search")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("search")?.setFilterValue(event.target.value)}
          className="h-8 w-full sm:max-w-xs"
        />
        {table.getColumn("category") ? (
          <DataTableFacetedFilter
            column={table.getColumn("category")}
            title="Category"
            options={CATEGORY_FILTER_OPTIONS}
          />
        ) : null}
        {table.getColumn("status") ? (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={STATUS_FILTER_OPTIONS}
          />
        ) : null}
      </div>
    </div>
  );
}

export interface NotificationsPanelProps {
  notifications: NotificationRecord[];
}

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  const router = useRouter();
  const [rows, setRows] = React.useState(notifications);
  const [markingAll, setMarkingAll] = React.useState(false);

  React.useEffect(() => {
    setRows(notifications);
  }, [notifications]);

  const unreadCount = rows.filter((n) => n.readAt == null).length;

  async function handleMarkAllRead() {
    setMarkingAll(true);
    const result = await markAllNotificationsReadAction();
    setMarkingAll(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    const now = Date.now();
    setRows((prev) => prev.map((n) => (n.readAt == null ? { ...n, readAt: now } : n)));
    toast.success(result.count > 0 ? "All notifications marked as read." : "Nothing to mark.");
    router.refresh();
  }

  async function handleOpen(notification: NotificationRecord) {
    if (notification.readAt == null) {
      const result = await markNotificationReadAction(notification.id);
      if (result.ok) {
        setRows((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, readAt: Date.now() } : n,
          ),
        );
      }
    }
    if (notification.href) {
      router.push(notification.href);
    }
  }

  const columns = React.useMemo<ColumnDef<NotificationRecord>[]>(
    () => [
      {
        id: "search",
        accessorFn: (row) =>
          `${formatNotificationTitle(row)} ${row.summary} ${row.category} ${row.entityLabel ?? ""}`,
        header: () => null,
        cell: () => null,
        enableHiding: true,
        filterFn: (row, _id, value) => {
          const q = String(value ?? "")
            .toLowerCase()
            .trim();
          if (!q) return true;
          const hay = String(row.getValue("search") ?? "").toLowerCase();
          return hay.includes(q);
        },
      },
      {
        id: "notification",
        accessorFn: (row) => formatNotificationTitle(row),
        header: "Notification",
        cell: ({ row }) => {
          const n = row.original;
          const unread = n.readAt == null;
          const title = formatNotificationTitle(n);
          return (
            <button
              type="button"
              className="flex w-full items-start gap-3 rounded-md p-1 text-left hover:bg-muted/50"
              onClick={() => void handleOpen(n)}
            >
              <Avatar className="size-10 shrink-0">
                <AvatarFallback
                  className={cn(
                    n.source === "system" ? "bg-muted" : "bg-primary/10 text-primary",
                  )}
                >
                  {n.source === "system" ? (
                    <FileText className="size-4" />
                  ) : (
                    actorInitials(n.actorName)
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1">
                <div className={cn("text-sm", unread ? "font-semibold" : "font-medium")}>
                  {title}
                </div>
                {n.entityLabel ? (
                  <div className="text-muted-foreground line-clamp-1 text-xs">{n.entityLabel}</div>
                ) : null}
              </div>
              {unread ? (
                <span className="bg-primary mt-1.5 size-2 shrink-0 rounded-full" aria-label="Unread" />
              ) : null}
            </button>
          );
        },
      },
      {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {notificationCategoryLabel(row.original.category)}
          </Badge>
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
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm capitalize">
            {row.original.readAt == null ? "Unread" : "Read"}
          </span>
        ),
        filterFn: (row, id, value) => {
          const selected = value as string[];
          if (!selected?.length) return true;
          return selected.includes(row.getValue(id) as string);
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Time" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm whitespace-nowrap">
            {formatNotificationTime(row.original.createdAt)}
          </span>
        ),
      },
    ],
    // handleOpen closes over setRows/router; columns recreate when rows identity changes is fine
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable handlers via refs would be overkill
    [rows],
  );

  return (
    <div className="mx-auto max-w-4xl space-y-4 xl:mt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You are up to date."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => void handleMarkAllRead()}
            disabled={markingAll || unreadCount === 0}
          >
            <Check />
            Mark all as read
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/settings/notifications" aria-label="Notification settings">
              <Settings />
            </Link>
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        initialPageSize={10}
        initialSorting={[{ id: "createdAt", desc: true }]}
        initialColumnVisibility={{ search: false }}
        emptyMessage={
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Users className="text-muted-foreground size-8" />
            <p className="text-muted-foreground text-sm">No notifications yet.</p>
          </div>
        }
        toolbar={(table) => <NotificationsToolbar table={table} />}
      />
    </div>
  );
}
