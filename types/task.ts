/** Internal / operational task row (optional `tasks` collection in Firestore). */
export interface TaskRecord {
  id: string;
  organizationId?: string;
  /** When set, task is scoped to a CRM customer profile. */
  customerId?: string;
  title: string;
  status: string;
  /** Deadline (epoch ms). */
  dueAt?: number;
  /** Optional schedule start (epoch ms) for board display. */
  startAt?: number;
  /** When to nudge assignee (epoch ms). */
  reminderAt?: number;
  /** Set by the scheduled reminder job after notify (or skip for prefs). */
  reminderSentAt?: number;
  updatedAt: number;
  description?: string;
  priority?: string;
  category?: string;
  progressPercent?: number;
  commentCount?: number;
  attachmentCount?: number;
  assigneeCount?: number;
  /** When set, “My Tasks” can filter to the signed-in staff member. */
  assignedToUid?: string;
  /** Hydrated on read — not persisted. */
  customerDisplayName?: string;
  /** Hydrated on read — not persisted. */
  assignedToDisplayName?: string;
  /** Hydrated on read — not persisted. */
  assignedToPhotoUrl?: string;
}
