import { cookies } from "next/headers";

import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { toSessionUserView } from "@/lib/auth/session-user-view";
import { PortalShell } from "@/components/layout/portal-shell";
import { ADMIN_PORTAL_NAV_GROUPS } from "@/config/admin-portal-routes";
import { getPortalAppearanceSettings } from "@/server/firestore/appearance-settings";
import type { PortalNavGroupView } from "@/components/layout/nav-types";

const ADMIN_NAV_GROUPS: PortalNavGroupView[] = ADMIN_PORTAL_NAV_GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
  items: group.items.map((item) => ({
    id: item.id,
    href: item.href,
    label: item.label,
  })),
}));

export default async function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentSessionUser();
  if (!user) {
    return null;
  }
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const appearance = await getPortalAppearanceSettings();
  const portalName = appearance?.portalName?.trim() || "Code Zero Labs";

  return (
    <PortalShell
      user={toSessionUserView(user)}
      groups={ADMIN_NAV_GROUPS}
      brand={{ label: portalName, href: "/admin", logoUrl: appearance?.logoUrl }}
      searchScope="admin"
      defaultOpen={defaultOpen}
    >
      {children}
    </PortalShell>
  );
}
