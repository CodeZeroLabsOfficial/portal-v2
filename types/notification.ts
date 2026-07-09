/** In-app notification categories — extend as new domains emit events. */
export type NotificationCategory =
  | "crm"
  | "proposal"
  | "billing"
  | "subscription"
  | "system"
  | "task";

export type NotificationSource = "staff_action" | "system";

export type NotificationEntityType =
  | "customer"
  | "opportunity"
  | "task"
  | "proposal"
  | "invoice"
  | "subscription"
  | "user"
  | "organization";

/** Top-level `notifications/{id}` inbox row for one staff recipient. */
export interface NotificationRecord {
  id: string;
  organizationId: string;
  recipientUid: string;
  actorUid?: string;
  actorName?: string;
  /** Past-tense verb phrase, e.g. `created a new lead` (UI prefixes actor when present). */
  summary: string;
  category: NotificationCategory;
  entityType?: NotificationEntityType;
  entityId?: string;
  entityLabel?: string;
  href?: string;
  source: NotificationSource;
  /** Epoch millis — set when the recipient marks the item read. */
  readAt?: number;
  /** Epoch millis. */
  createdAt: number;
  /** When set, used for deterministic doc ids / dedupe across retries. */
  idempotencyKey?: string;
}

export type NotificationInAppScope = "all" | "none";

/** Stored on `users/{uid}.notificationPreferences`. */
export interface NotificationPreferences {
  inAppScope: NotificationInAppScope;
  /** Reserved for outbound email — delivery not wired yet. */
  emailEnabled: boolean;
  /** Reserved — security emails stay on when those events exist. */
  securityEmail: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  inAppScope: "all",
  emailEnabled: false,
  securityEmail: true,
};
