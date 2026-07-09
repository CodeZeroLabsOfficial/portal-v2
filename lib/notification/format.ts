import { formatDistanceToNow } from "date-fns";

import type { NotificationRecord } from "@/types/notification";

/** Display line for inbox rows: `{actor} {summary}.` or `{summary}.` */
export function formatNotificationTitle(notification: NotificationRecord): string {
  const summary = notification.summary.replace(/\.\s*$/, "");
  if (notification.actorName?.trim()) {
    return `${notification.actorName.trim()} ${summary}.`;
  }
  return `${summary}.`;
}

export function formatNotificationTime(createdAt: number): string {
  if (!createdAt || createdAt <= 0) return "";
  try {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  } catch {
    return "";
  }
}

export function notificationCategoryLabel(category: NotificationRecord["category"]): string {
  switch (category) {
    case "crm":
      return "CRM";
    case "proposal":
      return "Proposal";
    case "billing":
      return "Billing";
    case "subscription":
      return "Subscription";
    case "task":
      return "Task";
    case "system":
    default:
      return "System";
  }
}
