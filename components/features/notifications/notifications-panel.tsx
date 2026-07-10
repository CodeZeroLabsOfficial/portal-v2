"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Settings } from "lucide-react";
import { toast } from "sonner";

import { NotificationsTable } from "@/components/features/notifications/notifications-table";
import { Button } from "@/components/ui/button";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/server/actions/notifications";
import type { NotificationRecord } from "@/types/notification";

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
          prev.map((n) => (n.id === notification.id ? { ...n, readAt: Date.now() } : n)),
        );
      }
    }
    if (notification.href) {
      router.push(notification.href);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 xl:mt-8">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Notifications</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => void handleMarkAllRead()}
            disabled={markingAll || unreadCount === 0}
          >
            <Check />
            Mark all as read
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/settings/notifications" aria-label="Notification settings">
              <Settings />
            </Link>
          </Button>
        </div>
      </div>

      <NotificationsTable data={rows} onOpen={(n) => void handleOpen(n)} />
    </div>
  );
}
