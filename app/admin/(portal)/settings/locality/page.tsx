import { redirect } from "next/navigation";

import { LocalitySettingsPageClient } from "@/components/features/settings/locality-settings-page-client";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getAllCurrencyCodes, getAllTimeZones } from "@/lib/locality/data";

export default async function AdminSettingsLocalityPage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/settings/locality");
  }

  return (
    <LocalitySettingsPageClient
      initialUser={user}
      timeZones={getAllTimeZones()}
      currencyCodes={getAllCurrencyCodes()}
    />
  );
}
