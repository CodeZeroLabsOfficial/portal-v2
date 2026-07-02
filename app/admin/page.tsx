import { connection } from "next/server";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/features/dashboard/admin-dashboard";
import { AdminDashboardRecentAside } from "@/components/features/dashboard/admin-dashboard-recent-aside";
import { PageHeader } from "@/components/shared/page-header";
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
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="CRM and operations are live — customers, pipeline, subscriptions, services, and tasks. Proposal builder ships in Phase 4."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <AdminDashboard data={data} displayName={displayName} userLabel={userLabel} />
        <AdminDashboardRecentAside data={data} />
      </div>
    </div>
  );
}
