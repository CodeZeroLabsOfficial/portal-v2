import { redirect } from "next/navigation";

import { ProfileSettingsPageClient } from "@/components/features/settings/profile-settings-page-client";
import { getCurrentSessionUser } from "@/lib/auth/server-session";

export default async function AdminSettingsProfilePage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/settings/profile");
  }

  return <ProfileSettingsPageClient initialUser={user} />;
}
