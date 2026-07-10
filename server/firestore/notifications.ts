import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";

import { logError } from "@/lib/common/logging";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { asString } from "@/lib/firestore/coerce";
import { millisFromFirestore } from "@/lib/firestore/timestamp";
import { isStaff } from "@/lib/auth/server-session";
import { COLLECTIONS } from "@/server/firestore/collections";
import type { PortalUser } from "@/types/user";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationCategory,
  type NotificationEntityType,
  type NotificationPreferences,
  type NotificationRecord,
  type NotificationSource,
} from "@/types/notification";

const NOTIFICATION_CATEGORIES = new Set<NotificationCategory>([
  "crm",
  "proposal",
  "billing",
  "subscription",
  "system",
  "task",
]);

function isStaffRole(role: unknown): boolean {
  return role === "admin" || role === "team";
}

function parseCategory(value: unknown): NotificationCategory {
  if (typeof value === "string" && NOTIFICATION_CATEGORIES.has(value as NotificationCategory)) {
    return value as NotificationCategory;
  }
  return "system";
}

function parseSource(value: unknown): NotificationSource {
  return value === "staff_action" ? "staff_action" : "system";
}

export function parseNotificationPreferences(raw: unknown): NotificationPreferences {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
  const data = raw as Record<string, unknown>;
  return {
    inAppScope: data.inAppScope === "none" ? "none" : "all",
    emailEnabled: data.emailEnabled === true,
    securityEmail: data.securityEmail !== false,
  };
}

export function parseNotificationRecord(
  id: string,
  data: Record<string, unknown>,
): NotificationRecord {
  const readAt = millisFromFirestore(data, "readAt");
  const title = asString(data.title);
  const message = asString(data.message);
  const summary = asString(data.summary);
  return {
    id,
    organizationId: asString(data.organizationId) ?? "",
    recipientUid: asString(data.recipientUid) ?? "",
    actorUid: asString(data.actorUid),
    actorName: asString(data.actorName),
    title: title ?? summary ?? "Notification",
    message: message ?? "",
    summary,
    category: parseCategory(data.category),
    entityType: asString(data.entityType) as NotificationEntityType | undefined,
    entityId: asString(data.entityId),
    entityLabel: asString(data.entityLabel),
    href: asString(data.href),
    source: parseSource(data.source),
    readAt: readAt > 0 ? readAt : undefined,
    createdAt: millisFromFirestore(data, "createdAt"),
    idempotencyKey: asString(data.idempotencyKey),
  };
}

/** Deterministic doc id so retries with the same key do not duplicate. */
export function notificationDocId(recipientUid: string, idempotencyKey: string): string {
  return createHash("sha256")
    .update(`${recipientUid}:${idempotencyKey}`)
    .digest("hex")
    .slice(0, 40);
}

export async function getNotificationPreferencesForUid(
  uid: string,
): Promise<NotificationPreferences> {
  const db = getFirebaseAdminFirestore();
  if (!db) return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  try {
    const snap = await db.collection(COLLECTIONS.users).doc(uid).get();
    if (!snap.exists) return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    const data = snap.data() as Record<string, unknown>;
    return parseNotificationPreferences(data.notificationPreferences);
  } catch (error) {
    logError("notification_prefs_read_failed", {
      uid,
      message: error instanceof Error ? error.message : "unknown",
    });
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
}

export async function listStaffUidsForOrganization(
  organizationId: string,
): Promise<Array<{ uid: string; prefs: NotificationPreferences }>> {
  const db = getFirebaseAdminFirestore();
  if (!db || !organizationId) return [];
  try {
    const snap = await db
      .collection(COLLECTIONS.users)
      .where("organizationId", "==", organizationId)
      .where("role", "in", ["admin", "team"])
      .limit(200)
      .get();

    return snap.docs
      .filter((doc) => isStaffRole((doc.data() as Record<string, unknown>).role))
      .map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        return {
          uid: doc.id,
          prefs: parseNotificationPreferences(data.notificationPreferences),
        };
      });
  } catch (error) {
    logError("notification_list_staff_failed", {
      organizationId,
      message: error instanceof Error ? error.message : "unknown",
    });
    return [];
  }
}

export interface CreateNotificationInput {
  organizationId: string;
  recipientUid: string;
  title: string;
  message: string;
  category: NotificationCategory;
  source: NotificationSource;
  actorUid?: string;
  actorName?: string;
  entityType?: NotificationEntityType;
  entityId?: string;
  entityLabel?: string;
  href?: string;
  idempotencyKey?: string;
}

function notificationPayload(
  input: CreateNotificationInput,
  now: number,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    organizationId: input.organizationId,
    recipientUid: input.recipientUid,
    title: input.title,
    message: input.message,
    category: input.category,
    source: input.source,
    createdAt: now,
  };
  if (input.actorUid) payload.actorUid = input.actorUid;
  if (input.actorName) payload.actorName = input.actorName;
  if (input.entityType) payload.entityType = input.entityType;
  if (input.entityId) payload.entityId = input.entityId;
  if (input.entityLabel) payload.entityLabel = input.entityLabel;
  if (input.href) payload.href = input.href;
  if (input.idempotencyKey) payload.idempotencyKey = input.idempotencyKey;
  return payload;
}

export async function createNotificationDocs(
  inputs: CreateNotificationInput[],
): Promise<void> {
  if (inputs.length === 0) return;
  const db = getFirebaseAdminFirestore();
  if (!db) return;

  const now = Date.now();
  // Idempotent keys need create-if-missing; non-keyed docs can batch.
  const keyed = inputs.filter((i) => i.idempotencyKey);
  const plain = inputs.filter((i) => !i.idempotencyKey);

  const chunkSize = 400;
  for (let i = 0; i < plain.length; i += chunkSize) {
    const chunk = plain.slice(i, i + chunkSize);
    const batch = db.batch();
    for (const input of chunk) {
      const ref = db.collection(COLLECTIONS.notifications).doc();
      batch.set(ref, notificationPayload(input, now));
    }
    try {
      await batch.commit();
    } catch (error) {
      logError("notification_batch_write_failed", {
        count: chunk.length,
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  for (const input of keyed) {
    try {
      const ref = db
        .collection(COLLECTIONS.notifications)
        .doc(notificationDocId(input.recipientUid, input.idempotencyKey!));
      const existing = await ref.get();
      if (existing.exists) continue;
      await ref.create(notificationPayload(input, now));
    } catch (error) {
      // Concurrent create races are expected for idempotent keys.
      const message = error instanceof Error ? error.message : "unknown";
      if (!/already exists|ALREADY_EXISTS/i.test(message)) {
        logError("notification_idempotent_write_failed", {
          recipientUid: input.recipientUid,
          message,
        });
      }
    }
  }
}

export async function listNotificationsForRecipient(
  user: PortalUser,
  options?: { limit?: number },
): Promise<NotificationRecord[]> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) return [];
  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 200);
  try {
    const snap = await db
      .collection(COLLECTIONS.notifications)
      .where("recipientUid", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snap.docs.map((doc) =>
      parseNotificationRecord(doc.id, doc.data() as Record<string, unknown>),
    );
  } catch (error) {
    logError("notification_list_failed", {
      uid: user.uid,
      message: error instanceof Error ? error.message : "unknown",
    });
    return [];
  }
}

export async function countUnreadForRecipient(user: PortalUser): Promise<number> {
  // Unread docs omit `readAt`; count from a recent window rather than a null-equality query.
  const recent = await listNotificationsForRecipient(user, { limit: 100 });
  return recent.filter((n) => n.readAt == null).length;
}

export async function markNotificationRead(
  user: PortalUser,
  notificationId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) {
    return { ok: false, message: "Not authorized." };
  }
  try {
    const ref = db.collection(COLLECTIONS.notifications).doc(notificationId);
    const snap = await ref.get();
    if (!snap.exists) {
      return { ok: false, message: "Notification not found." };
    }
    const data = snap.data() as Record<string, unknown>;
    if (asString(data.recipientUid) !== user.uid) {
      return { ok: false, message: "Notification not found." };
    }
    if (millisFromFirestore(data, "readAt") > 0) {
      return { ok: true };
    }
    await ref.update({ readAt: Date.now() });
    return { ok: true };
  } catch (error) {
    logError("notification_mark_read_failed", {
      uid: user.uid,
      notificationId,
      message: error instanceof Error ? error.message : "unknown",
    });
    return { ok: false, message: "Could not mark notification as read." };
  }
}

export async function markAllNotificationsRead(
  user: PortalUser,
): Promise<{ ok: true; count: number } | { ok: false; message: string }> {
  const db = getFirebaseAdminFirestore();
  if (!db || !isStaff(user)) {
    return { ok: false, message: "Not authorized." };
  }
  try {
    const unread = (await listNotificationsForRecipient(user, { limit: 200 })).filter(
      (n) => n.readAt == null,
    );
    if (unread.length === 0) return { ok: true, count: 0 };

    const now = Date.now();
    const chunkSize = 400;
    for (let i = 0; i < unread.length; i += chunkSize) {
      const batch = db.batch();
      for (const item of unread.slice(i, i + chunkSize)) {
        batch.update(db.collection(COLLECTIONS.notifications).doc(item.id), { readAt: now });
      }
      await batch.commit();
    }
    return { ok: true, count: unread.length };
  } catch (error) {
    logError("notification_mark_all_read_failed", {
      uid: user.uid,
      message: error instanceof Error ? error.message : "unknown",
    });
    return { ok: false, message: "Could not mark notifications as read." };
  }
}

export async function updateNotificationPreferencesForUser(
  user: PortalUser,
  prefs: NotificationPreferences,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return { ok: false, message: "Database is not configured." };
  }
  try {
    await db.collection(COLLECTIONS.users).doc(user.uid).set(
      {
        notificationPreferences: {
          inAppScope: prefs.inAppScope,
          emailEnabled: prefs.emailEnabled,
          securityEmail: prefs.securityEmail,
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return { ok: true };
  } catch (error) {
    logError("notification_prefs_save_failed", {
      uid: user.uid,
      message: error instanceof Error ? error.message : "unknown",
    });
    return { ok: false, message: "Could not save notification preferences." };
  }
}
