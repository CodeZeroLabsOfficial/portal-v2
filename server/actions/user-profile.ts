"use server";

import { revalidatePath } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";

import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { zodErrorToMessage } from "@/lib/common/zod-error";
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { runAdminWrite } from "@/lib/firebase/admin-write";
import { notifyStaffAction } from "@/lib/notification/notify";
import { updateUserProfileSchema } from "@/lib/schemas/user-profile";
import { COLLECTIONS } from "@/server/firestore/collections";

export async function updateCurrentUserProfileAction(
  raw: unknown,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await getCurrentSessionUser();
  if (!user) {
    return { ok: false, message: "You need to be signed in to update your profile." };
  }

  const parsed = updateUserProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: zodErrorToMessage(parsed.error) };
  }

  const db = getFirebaseAdminFirestore();
  if (!db) {
    return { ok: false, message: "Database is not configured." };
  }

  const v = parsed.data;
  const parts = [v.firstName.trim(), v.lastName.trim()].filter(Boolean);
  const displayName = parts.length > 0 ? parts.join(" ") : "";

  const nowTs = Timestamp.now();
  const payload: Record<string, unknown> = {
    firstName: v.firstName.trim(),
    lastName: v.lastName.trim(),
    phone: v.phone.trim(),
    website: v.website.trim(),
    dateOfBirth: v.dateOfBirth.trim(),
    addressLine1: v.addressLine1.trim(),
    addressLine2: v.addressLine2.trim(),
    city: v.city.trim(),
    region: v.region.trim(),
    postalCode: v.postalCode.trim(),
    country: v.country.trim(),
    displayName,
    updatedAt: nowTs,
  };

  if (v.photoURL !== undefined) {
    payload.photoURL = v.photoURL.trim();
  }

  const write = await runAdminWrite(
    "user_profile_save_failed",
    { uid: user.uid },
    "Could not save profile.",
    () => db.collection(COLLECTIONS.users).doc(user.uid).set(payload, { merge: true }),
  );
  if (!write.ok) return write;

  if (v.photoURL !== undefined) {
    const adminAuth = getFirebaseAdminAuth();
    if (adminAuth) {
      try {
        await adminAuth.updateUser(user.uid, { photoURL: v.photoURL.trim() || undefined });
      } catch {
        // Firestore is source of truth; Auth sync is best-effort.
      }
    }
  }

  await notifyStaffAction({
    actor: user,
    organizationId: user.organizationId,
    title: "Profile updated",
    message: displayName || user.email,
    category: "system",
    entity: { type: "user", id: user.uid, label: displayName || user.email },
    href: "/admin/settings/profile",
  });

  revalidatePath("/admin/settings", "layout");
  revalidatePath("/admin/settings/profile");

  return { ok: true };
}
