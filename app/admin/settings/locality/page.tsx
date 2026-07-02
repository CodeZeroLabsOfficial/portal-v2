import { redirect } from "next/navigation";

import { LocalitySettingsForm } from "@/components/features/settings/locality-settings-form";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getAllCurrencyCodes, getAllTimeZones } from "@/lib/locality/data";

export default async function AdminSettingsLocalityPage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/settings/locality");
  }

  return (
    <LocalitySettingsForm
      user={user}
      timeZones={getAllTimeZones()}
      currencyCodes={getAllCurrencyCodes()}
    />
  );
}
