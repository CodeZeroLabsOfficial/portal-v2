import { redirect } from "next/navigation";

import { CompanySettingsView } from "@/components/features/settings/company-settings-view";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getWorkspaceCompanySettings } from "@/server/firestore/organization-settings";

export default async function AdminSettingsCompanyPage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/settings/company");
  }

  const settings = await getWorkspaceCompanySettings(user);
  if (!settings) {
    return (
      <p className="text-sm text-destructive">
        Company settings could not be loaded. Check that Firebase Admin is configured.
      </p>
    );
  }

  return <CompanySettingsView settings={settings} />;
}
