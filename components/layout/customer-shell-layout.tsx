import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { toSessionUserView } from "@/lib/auth/session-user-view";
import { toCustomerPortalNavViews } from "@/config/customer-portal-routes";
import { PortalShell } from "@/components/layout/portal-shell";
import { getPortalAppearanceSettings } from "@/server/firestore/appearance-settings";
import type { PortalNavItemView } from "@/components/layout/nav-types";

/** Shared shell for customer-facing routes (`/dashboard`, `/customer`). */
export async function CustomerShellLayout({
  children,
  currentPath,
}: {
  children: React.ReactNode;
  currentPath: string;
}) {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect(`/login?next=${currentPath}`);
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const navItems: PortalNavItemView[] = toCustomerPortalNavViews();
  const appearance = await getPortalAppearanceSettings();
  const portalName = appearance?.portalName?.trim() || "Code Zero Labs";

  return (
    <PortalShell
      user={toSessionUserView(user)}
      items={navItems}
      footerItems={[]}
      brand={{ label: portalName, href: "/dashboard", logoUrl: appearance?.logoUrl }}
      searchScope="customer"
      defaultOpen={defaultOpen}
    >
      {children}
    </PortalShell>
  );
}
