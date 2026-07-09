import { createHash } from "node:crypto";
import * as admin from "firebase-admin";
import type { Firestore } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

const TASKS = "tasks";
const USERS = "users";
const NOTIFICATIONS = "notifications";

function getDb(): Firestore {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.firestore();
}

/** Matches Portal `isTaskOpenStatus` — skip completed/cancelled tasks. */
function isTaskOpenStatus(status: unknown): boolean {
  const normalized = typeof status === "string" ? status.toLowerCase() : "";
  return (
    normalized !== "done" &&
    normalized !== "completed" &&
    normalized !== "cancelled" &&
    normalized !== "canceled" &&
    normalized !== "closed"
  );
}

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function notificationDocId(recipientUid: string, idempotencyKey: string): string {
  return createHash("sha256")
    .update(`${recipientUid}:${idempotencyKey}`)
    .digest("hex")
    .slice(0, 40);
}

async function recipientAllowsInApp(db: Firestore, uid: string): Promise<boolean> {
  try {
    const snap = await db.collection(USERS).doc(uid).get();
    if (!snap.exists) return true;
    const prefs = (snap.data() as Record<string, unknown>).notificationPreferences;
    if (!prefs || typeof prefs !== "object" || Array.isArray(prefs)) return true;
    return (prefs as Record<string, unknown>).inAppScope !== "none";
  } catch {
    return true;
  }
}

async function notifyAssigneeTaskReminder(
  db: Firestore,
  input: {
    organizationId: string;
    recipientUid: string;
    taskId: string;
    title: string;
    reminderAt: number;
  },
): Promise<boolean> {
  if (!(await recipientAllowsInApp(db, input.recipientUid))) {
    return false;
  }

  const fullKey = `task:reminder:${input.taskId}:${input.reminderAt}:to:${input.recipientUid}`;
  const ref = db.collection(NOTIFICATIONS).doc(notificationDocId(input.recipientUid, fullKey));
  const existing = await ref.get();
  if (existing.exists) return true;

  const now = Date.now();
  await ref.create({
    organizationId: input.organizationId,
    recipientUid: input.recipientUid,
    summary: `Task reminder: "${input.title}"`,
    category: "task",
    source: "system",
    entityType: "task",
    entityId: input.taskId,
    entityLabel: input.title,
    href: "/admin/tasks",
    idempotencyKey: fullKey,
    createdAt: now,
  });
  return true;
}

/**
 * Processes due task reminders: notifies the assignee and sets `reminderSentAt`.
 */
export async function processDueTaskReminders(db: Firestore): Promise<{
  scanned: number;
  notified: number;
  marked: number;
  skipped: number;
}> {
  const now = Date.now();
  // Bound lookback so a first deploy does not flood ancient due reminders.
  const lookbackMs = 7 * 24 * 60 * 60 * 1000;
  const minReminderAt = now - lookbackMs;

  const snap = await db
    .collection(TASKS)
    .where("reminderAt", ">=", minReminderAt)
    .where("reminderAt", "<=", now)
    .orderBy("reminderAt", "asc")
    .limit(100)
    .get();

  let notified = 0;
  let marked = 0;
  let skipped = 0;

  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>;
    const reminderAt = asFiniteNumber(data.reminderAt);
    const reminderSentAt = asFiniteNumber(data.reminderSentAt);
    const assignedToUid = asNonEmptyString(data.assignedToUid);
    const organizationId = asNonEmptyString(data.organizationId);
    const title = asNonEmptyString(data.title) ?? "Task";

    if (reminderSentAt != null) {
      skipped += 1;
      continue;
    }
    if (reminderAt == null || !assignedToUid || !organizationId) {
      skipped += 1;
      continue;
    }
    if (!isTaskOpenStatus(data.status)) {
      skipped += 1;
      continue;
    }

    try {
      const wrote = await notifyAssigneeTaskReminder(db, {
        organizationId,
        recipientUid: assignedToUid,
        taskId: doc.id,
        title,
        reminderAt,
      });
      if (wrote) notified += 1;

      // Always stamp so we do not retry forever when prefs are "none".
      await doc.ref.update({
        reminderSentAt: now,
        updatedAt: FieldValue.serverTimestamp(),
      });
      marked += 1;
    } catch (error) {
      logger.error("task_reminder_process_failed", {
        taskId: doc.id,
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  return { scanned: snap.size, notified, marked, skipped };
}

/** Every 15 minutes — due task reminders for assignees. */
export const processTaskReminders = onSchedule(
  {
    schedule: "every 15 minutes",
    timeZone: "Australia/Sydney",
    region: "australia-southeast1",
  },
  async () => {
    const result = await processDueTaskReminders(getDb());
    logger.info("task_reminders_tick", result);
  },
);
