import { redirect } from "next/navigation";

import { UserProfileForm } from "@/components/features/settings/user-profile-form";
import { getCurrentSessionUser } from "@/lib/auth/server-session";

export default async function AdminSettingsProfileEditPage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/settings/profile/edit");
  }

  return <UserProfileForm user={user} />;
}
