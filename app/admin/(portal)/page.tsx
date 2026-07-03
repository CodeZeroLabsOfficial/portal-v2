import { connection } from "next/server";
import { redirect } from "next/navigation";

import { AdminDashboardShell } from "@/components/features/dashboard/admin-dashboard-shell";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getAdminPortalData } from "@/server/firestore/portal-data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await connection();
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin");
  }

  const data = await getAdminPortalData(user);
  const displayName = user.displayName ?? "";
  const userLabel = user.email || user.uid;

  return (
    <AdminDashboardShell data={data} displayName={displayName} userLabel={userLabel} />
  );
}
