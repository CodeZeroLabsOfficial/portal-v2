import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { SettingsSidebarNav } from "@/components/features/settings/settings-sidebar-nav";
import { getCurrentSessionUser } from "@/lib/auth/server-session";

export default async function AdminSettingsLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/settings");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 lg:space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your company, profile, regional preferences, and integrations."
      />
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
        <aside className="lg:w-64">
          <SettingsSidebarNav />
        </aside>
        <div className="min-w-0 flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
