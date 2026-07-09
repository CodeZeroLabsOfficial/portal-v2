import { redirect } from "next/navigation";

import { NotificationPreferencesForm } from "@/components/features/settings/notification-preferences-form";
import { requireStaffSession } from "@/lib/auth/server-session";
import { getNotificationPreferencesForUid } from "@/server/firestore/notifications";

export default async function AdminSettingsNotificationsPage() {
  const user = await requireStaffSession();
  if (!user) {
    redirect("/login?next=/admin/settings/notifications");
  }

  const preferences = await getNotificationPreferencesForUid(user.uid);

  return <NotificationPreferencesForm initialPreferences={preferences} />;
}
