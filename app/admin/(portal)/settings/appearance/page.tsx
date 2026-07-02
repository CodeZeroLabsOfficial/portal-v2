import { redirect } from "next/navigation";

import { AppearanceSettingsPageClient } from "@/components/features/settings/appearance-settings-page-client";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getPortalAppearanceSettings } from "@/server/firestore/appearance-settings";

export default async function AdminSettingsAppearancePage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/settings/appearance");
  }

  const settings = await getPortalAppearanceSettings();
  if (!settings) {
    return (
      <p className="text-sm text-destructive">
        Appearance settings could not be loaded. Check that Firebase Admin is configured.
      </p>
    );
  }

  return <AppearanceSettingsPageClient initialSettings={settings} />;
}
