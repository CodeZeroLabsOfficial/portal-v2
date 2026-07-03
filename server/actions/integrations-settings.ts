"use server";

import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

import { requireStaffSession } from "@/lib/auth/server-session";
import { zodErrorToMessage } from "@/lib/common/zod-error";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { runAdminWrite } from "@/lib/firebase/admin-write";
import { updateIntegrationsSettingsSchema } from "@/lib/schemas/integrations-settings";
import {
  getPortalIntegrationsSettings,
  INTEGRATIONS_SETTINGS_DOC_ID,
} from "@/server/firestore/integrations-settings";
import { COLLECTIONS } from "@/server/firestore/collections";
import type { PortalIntegrationsSettings } from "@/types/integrations";

export async function getPortalIntegrationsSettingsAction(): Promise<
  { ok: true; settings: PortalIntegrationsSettings } | { ok: false; message: string }
> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need staff access to view integration settings." };
  }

  const settings = await getPortalIntegrationsSettings();
  if (settings === null) {
    return { ok: false, message: "Integration settings could not be loaded." };
  }

  return { ok: true, settings };
}

export async function updatePortalIntegrationsSettingsAction(
  raw: unknown,
): Promise<{ ok: true; settings: PortalIntegrationsSettings } | { ok: false; message: string }> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need staff access to update integration settings." };
  }

  const parsed = updateIntegrationsSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: zodErrorToMessage(parsed.error) };
  }

  const db = getFirebaseAdminFirestore();
  if (!db) {
    return { ok: false, message: "Database is not configured." };
  }

  const v = parsed.data;
  const stripePublishableKey = v.stripePublishableKey.trim();
  const webhookUrl = v.webhookUrl.trim();
  const nowMs = Date.now();

  const payload: Record<string, unknown> = { updatedAt: nowMs };

  if (stripePublishableKey) {
    payload.stripePublishableKey = stripePublishableKey;
  } else {
    payload.stripePublishableKey = FieldValue.delete();
  }

  if (webhookUrl) {
    payload.webhookUrl = webhookUrl;
  } else {
    payload.webhookUrl = FieldValue.delete();
  }

  const write = await runAdminWrite(
    "integrations_settings_save_failed",
    { uid: user.uid },
    "Could not save integration settings.",
    () =>
      db
        .collection(COLLECTIONS.appSettings)
        .doc(INTEGRATIONS_SETTINGS_DOC_ID)
        .set(payload, { merge: true }),
  );
  if (!write.ok) return write;

  const settings: PortalIntegrationsSettings = {
    stripePublishableKey: stripePublishableKey || undefined,
    webhookUrl: webhookUrl || undefined,
    updatedAt: nowMs,
  };

  revalidatePath("/admin/settings/integrations");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/p", "layout");

  return { ok: true, settings };
}

export async function disconnectStripeIntegrationAction(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need staff access to update integration settings." };
  }

  const db = getFirebaseAdminFirestore();
  if (!db) {
    return { ok: false, message: "Database is not configured." };
  }

  const write = await runAdminWrite(
    "integrations_stripe_disconnect_failed",
    { uid: user.uid },
    "Could not disconnect Stripe.",
    () =>
      db.collection(COLLECTIONS.appSettings).doc(INTEGRATIONS_SETTINGS_DOC_ID).set(
        {
          stripePublishableKey: FieldValue.delete(),
          webhookUrl: FieldValue.delete(),
          updatedAt: Date.now(),
        },
        { merge: true },
      ),
  );
  if (!write.ok) return write;

  revalidatePath("/admin/settings/integrations");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/p", "layout");

  return { ok: true };
}
