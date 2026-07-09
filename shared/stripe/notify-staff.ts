import { createHash } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";

import { COLLECTIONS } from "./collections";

/**
 * Best-effort staff inbox fan-out from Stripe webhooks (Cloud Functions copy of shared/).
 * Skips recipients with `notificationPreferences.inAppScope === "none"`.
 */
export async function notifyOrgStaffSystemEvent(
  db: Firestore,
  input: {
    organizationId: string;
    summary: string;
    category: "billing" | "subscription";
    entityType?: "invoice" | "subscription" | "payment";
    entityId?: string;
    entityLabel?: string;
    href?: string;
    idempotencyKey?: string;
  },
): Promise<void> {
  if (!input.organizationId) return;

  try {
    const snap = await db
      .collection(COLLECTIONS.users)
      .where("organizationId", "==", input.organizationId)
      .where("role", "in", ["admin", "team"])
      .limit(200)
      .get();

    const now = Date.now();
    for (const doc of snap.docs) {
      const data = doc.data() as Record<string, unknown>;
      const prefs = data.notificationPreferences;
      if (
        prefs &&
        typeof prefs === "object" &&
        !Array.isArray(prefs) &&
        (prefs as Record<string, unknown>).inAppScope === "none"
      ) {
        continue;
      }

      const recipientUid = doc.id;
      const payload: Record<string, unknown> = {
        organizationId: input.organizationId,
        recipientUid,
        summary: input.summary,
        category: input.category,
        source: "system",
        createdAt: now,
      };
      if (input.entityType) payload.entityType = input.entityType;
      if (input.entityId) payload.entityId = input.entityId;
      if (input.entityLabel) payload.entityLabel = input.entityLabel;
      if (input.href) payload.href = input.href;
      const fullKey = input.idempotencyKey
        ? `${input.idempotencyKey}:to:${recipientUid}`
        : undefined;
      if (fullKey) payload.idempotencyKey = fullKey;

      const ref = fullKey
        ? db
            .collection(COLLECTIONS.notifications)
            .doc(
              createHash("sha256")
                .update(`${recipientUid}:${fullKey}`)
                .digest("hex")
                .slice(0, 40),
            )
        : db.collection(COLLECTIONS.notifications).doc();

      if (fullKey) {
        const existing = await ref.get();
        if (existing.exists) continue;
        await ref.create(payload).catch(() => {});
      } else {
        await ref.set(payload);
      }
    }
  } catch {
    // Webhook mirroring must not fail because of notification fan-out.
  }
}
