import type { NotificationRecord } from "@/types/notification";

/** Event headline for inbox rows (falls back to legacy `summary`). */
export function notificationDisplayTitle(notification: NotificationRecord): string {
  const title = notification.title?.trim();
  if (title) return title;
  const legacy = notification.summary?.trim();
  if (legacy) return legacy.replace(/\.\s*$/, "");
  return "Notification";
}

/** Detail line under the title (falls back to entity label for legacy rows). */
export function notificationDisplayMessage(notification: NotificationRecord): string {
  const message = notification.message?.trim();
  if (message) return message;
  return notification.entityLabel?.trim() ?? "";
}

/** Actor label for display — staff name, or System when no actor. */
export function notificationDisplayActor(notification: NotificationRecord): string {
  const name = notification.actorName?.trim();
  if (name) return name;
  return "System";
}

/**
 * Absolute local datetime without a comma between date and time.
 * Example: `10 Jul 2026 2:41 pm`
 */
export function formatNotificationDateTime(createdAt: number): string {
  if (!createdAt || createdAt <= 0) return "";
  try {
    const date = new Date(createdAt);
    const datePart = new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
    const timePart = new Intl.DateTimeFormat("en-AU", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .format(date)
      .toLowerCase()
      .replace(/\u202f/g, " ");
    return `${datePart} ${timePart}`;
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
