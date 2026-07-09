"use server";

import { revalidatePath } from "next/cache";

import { requireStaffSession } from "@/lib/auth/server-session";
import { zodErrorToMessage } from "@/lib/common/zod-error";
import { updateNotificationPreferencesSchema } from "@/lib/schemas/notification-preferences";
import {
  countUnreadForRecipient,
  getNotificationPreferencesForUid,
  listNotificationsForRecipient,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferencesForUser,
} from "@/server/firestore/notifications";
import type { NotificationPreferences, NotificationRecord } from "@/types/notification";

function revalidateNotificationViews() {
  revalidatePath("/admin/notifications");
  revalidatePath("/admin", "layout");
}

export async function listMyNotificationsAction(
  options?: { limit?: number },
): Promise<
  { ok: true; notifications: NotificationRecord[] } | { ok: false; message: string }
> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need to be signed in as staff." };
  }
  const notifications = await listNotificationsForRecipient(user, options);
  return { ok: true, notifications };
}

export async function getMyUnreadNotificationCountAction(): Promise<
  { ok: true; count: number } | { ok: false; message: string }
> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need to be signed in as staff." };
  }
  const count = await countUnreadForRecipient(user);
  return { ok: true, count };
}

export async function markNotificationReadAction(
  notificationId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need to be signed in as staff." };
  }
  if (!notificationId.trim()) {
    return { ok: false, message: "Notification id is required." };
  }
  const result = await markNotificationRead(user, notificationId.trim());
  if (result.ok) revalidateNotificationViews();
  return result;
}

export async function markAllNotificationsReadAction(): Promise<
  { ok: true; count: number } | { ok: false; message: string }
> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need to be signed in as staff." };
  }
  const result = await markAllNotificationsRead(user);
  if (result.ok) revalidateNotificationViews();
  return result;
}

export async function getMyNotificationPreferencesAction(): Promise<
  { ok: true; preferences: NotificationPreferences } | { ok: false; message: string }
> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need to be signed in as staff." };
  }
  const preferences = await getNotificationPreferencesForUid(user.uid);
  return { ok: true, preferences };
}

export async function updateMyNotificationPreferencesAction(
  raw: unknown,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need to be signed in as staff." };
  }

  const parsed = updateNotificationPreferencesSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: zodErrorToMessage(parsed.error) };
  }

  const result = await updateNotificationPreferencesForUser(user, {
    inAppScope: parsed.data.inAppScope,
    emailEnabled: parsed.data.emailEnabled,
    securityEmail: true,
  });
  if (result.ok) {
    revalidatePath("/admin/settings", "layout");
    revalidatePath("/admin/settings/notifications");
  }
  return result;
}
