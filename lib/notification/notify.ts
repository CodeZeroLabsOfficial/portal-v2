import { logError } from "@/lib/common/logging";
import {
  createNotificationDocs,
  listStaffUidsForOrganization,
  type CreateNotificationInput,
} from "@/server/firestore/notifications";
import type {
  NotificationCategory,
  NotificationEntityType,
} from "@/types/notification";
import type { PortalUser } from "@/types/user";

export function staffActorName(user: Pick<PortalUser, "displayName" | "name" | "email">): string {
  const display = user.displayName?.trim();
  if (display) return display;
  const name = user.name?.trim();
  if (name) return name;
  const email = user.email?.trim();
  if (email) return email;
  return "Someone";
}

export interface NotifyEntityRef {
  type: NotificationEntityType;
  id: string;
  label?: string;
}

export interface NotifyStaffActionInput {
  actor: PortalUser;
  organizationId?: string;
  summary: string;
  category: NotificationCategory;
  entity?: NotifyEntityRef;
  href?: string;
  idempotencyKey?: string;
}

export interface NotifySystemInput {
  organizationId: string;
  summary: string;
  category: NotificationCategory;
  entity?: NotifyEntityRef;
  href?: string;
  actorName?: string;
  idempotencyKey?: string;
}

/**
 * Fan-out an in-app notification for a staff-initiated mutation.
 * Includes the actor (Sonner remains immediate UX feedback only). Respects recipient prefs.
 */
export async function notifyStaffAction(input: NotifyStaffActionInput): Promise<void> {
  const organizationId = input.organizationId ?? input.actor.organizationId;
  if (!organizationId) return;

  try {
    const staff = await listStaffUidsForOrganization(organizationId);
    const actorName = staffActorName(input.actor);
    const recipients = staff.filter((s) => s.prefs.inAppScope !== "none");
    if (recipients.length === 0) return;

    const docs: CreateNotificationInput[] = recipients.map((r) => ({
      organizationId,
      recipientUid: r.uid,
      summary: input.summary,
      category: input.category,
      source: "staff_action",
      actorUid: input.actor.uid,
      actorName,
      entityType: input.entity?.type,
      entityId: input.entity?.id,
      entityLabel: input.entity?.label,
      href: input.href,
      idempotencyKey: input.idempotencyKey
        ? `${input.idempotencyKey}:to:${r.uid}`
        : undefined,
    }));

    await createNotificationDocs(docs);
  } catch (error) {
    logError("notify_staff_action_failed", {
      summary: input.summary,
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}

/**
 * Fan-out a system/external event to all org staff (respecting prefs).
 */
export async function notifySystem(input: NotifySystemInput): Promise<void> {
  if (!input.organizationId) return;

  try {
    const staff = await listStaffUidsForOrganization(input.organizationId);
    const recipients = staff.filter((s) => s.prefs.inAppScope !== "none");
    if (recipients.length === 0) return;

    const docs: CreateNotificationInput[] = recipients.map((r) => ({
      organizationId: input.organizationId,
      recipientUid: r.uid,
      summary: input.summary,
      category: input.category,
      source: "system",
      actorName: input.actorName,
      entityType: input.entity?.type,
      entityId: input.entity?.id,
      entityLabel: input.entity?.label,
      href: input.href,
      idempotencyKey: input.idempotencyKey
        ? `${input.idempotencyKey}:to:${r.uid}`
        : undefined,
    }));

    await createNotificationDocs(docs);
  } catch (error) {
    logError("notify_system_failed", {
      summary: input.summary,
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}
