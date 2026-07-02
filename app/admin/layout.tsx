import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentSessionUser, isStaff } from "@/lib/auth/server-session";
import { toSessionUserView } from "@/lib/auth/session-user-view";
import { PortalShell } from "@/components/layout/portal-shell";
import { ADMIN_PORTAL_NAV, ADMIN_PORTAL_NAV_FOOTER } from "@/config/admin-portal-routes";
import type { PortalNavItemView } from "@/components/layout/nav-types";

const ADMIN_NAV_ITEMS: PortalNavItemView[] = ADMIN_PORTAL_NAV.map((item) => ({
  id: item.id,
  href: item.href,
  label: item.label,
}));

const ADMIN_FOOTER_ITEMS: PortalNavItemView[] = ADMIN_PORTAL_NAV_FOOTER.map((item) => ({
  id: item.id,
  href: item.href,
  label: item.label,
}));

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin");
  }
  if (!isStaff(user)) {
    redirect("/dashboard");
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <PortalShell
      user={toSessionUserView(user)}
      items={ADMIN_NAV_ITEMS}
      footerItems={ADMIN_FOOTER_ITEMS}
      brand={{ label: "Code Zero Labs", href: "/admin" }}
      searchScope="admin"
      defaultOpen={defaultOpen}
    >
      {children}
    </PortalShell>
  );
}
