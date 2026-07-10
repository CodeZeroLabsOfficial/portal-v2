import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSignIcon,
  BellIcon,
  Building2Icon,
  FileTextIcon,
  SettingsIcon,
  SquareCheckIcon,
  SquareKanbanIcon,
  UsersIcon,
  WalletMinimalIcon,
} from "lucide-react";

import type {
  NotificationCategory,
  NotificationEntityType,
  NotificationRecord,
} from "@/types/notification";

export type NotificationVisual =
  | { kind: "avatar"; initials: string; className: string }
  | { kind: "icon"; Icon: LucideIcon; className: string };

function entityInitials(label?: string): string {
  if (!label?.trim()) return "?";
  const parts = label.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
}

const ENTITY_ICON_MAP: Record<
  Exclude<NotificationEntityType, "customer" | "user">,
  { Icon: LucideIcon; className: string }
> = {
  opportunity: {
    Icon: SquareKanbanIcon,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  task: {
    Icon: SquareCheckIcon,
    className: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  },
  proposal: {
    Icon: FileTextIcon,
    className: "bg-primary/10 text-primary",
  },
  subscription: {
    Icon: WalletMinimalIcon,
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
  invoice: {
    Icon: BadgeDollarSignIcon,
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  organization: {
    Icon: Building2Icon,
    className: "bg-muted text-muted-foreground",
  },
};

const CATEGORY_ICON_MAP: Record<NotificationCategory, { Icon: LucideIcon; className: string }> = {
  crm: {
    Icon: UsersIcon,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  proposal: {
    Icon: FileTextIcon,
    className: "bg-primary/10 text-primary",
  },
  billing: {
    Icon: BadgeDollarSignIcon,
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  subscription: {
    Icon: WalletMinimalIcon,
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
  task: {
    Icon: SquareCheckIcon,
    className: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  },
  system: {
    Icon: SettingsIcon,
    className: "bg-muted text-muted-foreground",
  },
};

/** Avatar or colored icon circle for a notification row — keyed on entity, then category. */
export function notificationVisual(notification: NotificationRecord): NotificationVisual {
  const entityType = notification.entityType;

  if (entityType === "customer") {
    return {
      kind: "avatar",
      initials: entityInitials(notification.entityLabel),
      className: "bg-primary/10 text-primary",
    };
  }

  if (entityType === "user") {
    const label = notification.entityLabel?.trim() || notification.actorName;
    return {
      kind: "avatar",
      initials: entityInitials(label),
      className: "bg-muted text-foreground",
    };
  }

  if (entityType && entityType in ENTITY_ICON_MAP) {
    const mapped = ENTITY_ICON_MAP[entityType as keyof typeof ENTITY_ICON_MAP];
    return { kind: "icon", Icon: mapped.Icon, className: mapped.className };
  }

  const category = CATEGORY_ICON_MAP[notification.category] ?? {
    Icon: BellIcon,
    className: "bg-muted text-muted-foreground",
  };
  return { kind: "icon", Icon: category.Icon, className: category.className };
}
