import { redirect } from "next/navigation";

import { UserProfileView } from "@/components/features/settings/user-profile-view";
import { getCurrentSessionUser } from "@/lib/auth/server-session";

export default async function AdminSettingsProfilePage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/settings/profile");
  }

  return <UserProfileView user={user} />;
}
