"use server";

import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

import { requireStaffSession } from "@/lib/auth/server-session";
import { zodErrorToMessage } from "@/lib/common/zod-error";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { runAdminWrite } from "@/lib/firebase/admin-write";
import { updateAppearanceSettingsSchema } from "@/lib/schemas/appearance-settings";
import {
  APPEARANCE_SETTINGS_DOC_ID,
  getPortalAppearanceSettings,
} from "@/server/firestore/appearance-settings";
import { COLLECTIONS } from "@/server/firestore/collections";
import type { PortalAppearanceSettings } from "@/types/appearance";

export async function getPortalAppearanceSettingsAction(): Promise<
  { ok: true; settings: PortalAppearanceSettings } | { ok: false; message: string }
> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need staff access to view appearance settings." };
  }

  const settings = await getPortalAppearanceSettings();
  if (!settings) {
    return { ok: false, message: "Appearance settings could not be loaded." };
  }

  return { ok: true, settings };
}

export async function updatePortalAppearanceSettingsAction(
  raw: unknown,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need staff access to update appearance settings." };
  }

  const parsed = updateAppearanceSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: zodErrorToMessage(parsed.error) };
  }

  const db = getFirebaseAdminFirestore();
  if (!db) {
    return { ok: false, message: "Database is not configured." };
  }

  const v = parsed.data;
  const primaryColorHex = v.primaryColorHex.trim();
  const logoUrl = v.logoUrl?.trim() ?? "";
  const faviconUrl = v.faviconUrl?.trim() ?? "";

  const payload: Record<string, unknown> = {
    portalName: v.portalName.trim(),
    fontFamily: v.fontFamily,
    updatedAt: Date.now(),
  };

  if (primaryColorHex) {
    payload.primaryColorHex = primaryColorHex;
  } else {
    payload.primaryColorHex = FieldValue.delete();
  }

  if (logoUrl) {
    payload.logoUrl = logoUrl;
  } else {
    payload.logoUrl = FieldValue.delete();
  }

  if (faviconUrl) {
    payload.faviconUrl = faviconUrl;
  } else {
    payload.faviconUrl = FieldValue.delete();
  }

  const write = await runAdminWrite(
    "appearance_settings_save_failed",
    { uid: user.uid },
    "Could not save appearance settings.",
    () =>
      db
        .collection(COLLECTIONS.appSettings)
        .doc(APPEARANCE_SETTINGS_DOC_ID)
        .set(payload, { merge: true }),
  );
  if (!write.ok) return write;

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/settings", "layout");
  revalidatePath("/admin/settings/appearance");
  revalidatePath("/icon");
  revalidatePath("/favicon.ico");

  return { ok: true };
}
