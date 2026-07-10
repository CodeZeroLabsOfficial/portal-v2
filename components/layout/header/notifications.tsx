"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BellIcon, ClockIcon } from "lucide-react";

import { NotificationVisual } from "@/components/features/notifications/notification-visual";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  formatNotificationDateTime,
  notificationDisplayActor,
  notificationDisplayMessage,
  notificationDisplayTitle,
} from "@/lib/notification/format";
import { cn } from "@/lib/utils";
import {
  listMyNotificationsAction,
  markNotificationReadAction,
} from "@/server/actions/notifications";
import type { NotificationRecord } from "@/types/notification";

export default function Notifications() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [items, setItems] = React.useState<NotificationRecord[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const unreadCount = items.filter((n) => n.readAt == null).length;

  const load = React.useCallback(async () => {
    const result = await listMyNotificationsAction({ limit: 20 });
    if (result.ok) {
      setItems(result.notifications);
      setLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (open) void load();
  }, [open, load]);

  async function handleOpen(notification: NotificationRecord) {
    if (notification.readAt == null) {
      const result = await markNotificationReadAction(notification.id);
      if (result.ok) {
        setItems((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, readAt: Date.now() } : n)),
        );
      }
    }
    setOpen(false);
    if (notification.href) {
      router.push(notification.href);
    } else {
      router.push("/admin/notifications");
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost" className="relative">
          <BellIcon />
          {unreadCount > 0 ? (
            <span className="bg-destructive absolute end-0.5 top-0.5 block size-1.5 shrink-0 rounded-full" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={isMobile ? "center" : "end"} className="ms-4 w-80 p-0">
        <DropdownMenuLabel className="bg-background dark:bg-muted sticky top-0 z-10 p-0">
          <div className="flex justify-between border-b px-6 py-4">
            <div className="font-medium">Notifications</div>
            <Button variant="link" className="h-auto p-0 text-xs" size="icon-sm" asChild>
              <Link href="/admin/notifications">View all</Link>
            </Button>
          </div>
        </DropdownMenuLabel>

        <ScrollArea className="h-[350px]">
          {!loaded ? (
            <div className="text-muted-foreground px-4 py-8 text-center text-sm">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground px-4 py-8 text-center text-sm">
              No notifications yet.
            </div>
          ) : (
            items.map((item) => {
              const unread = item.readAt == null;
              const title = notificationDisplayTitle(item);
              const message = notificationDisplayMessage(item);
              const actor = notificationDisplayActor(item);
              return (
                <DropdownMenuItem
                  key={item.id}
                  className="group flex cursor-pointer items-start gap-3 rounded-none border-b px-4 py-3"
                  onSelect={(event) => {
                    event.preventDefault();
                    void handleOpen(item);
                  }}
                >
                  <div className="flex flex-1 items-start gap-2">
                    <NotificationVisual
                      notification={item}
                      className="size-8"
                      iconClassName="size-3.5"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div
                        className={cn(
                          "line-clamp-2 text-sm",
                          unread ? "font-semibold" : "font-medium",
                        )}
                      >
                        {title}
                      </div>
                      {message ? (
                        <div className="text-muted-foreground line-clamp-2 text-xs">{message}</div>
                      ) : null}
                      <div className="text-muted-foreground text-xs">By {actor}</div>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <ClockIcon className="size-3!" />
                        {formatNotificationDateTime(item.createdAt)}
                      </div>
                    </div>
                  </div>
                  {unread ? (
                    <span className="bg-destructive/80 mt-1.5 block size-2 shrink-0 rounded-full border" />
                  ) : null}
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
