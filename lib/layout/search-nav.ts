"use client";

import { ADMIN_PORTAL_NAV_GROUPS } from "@/config/admin-portal-routes";
import { CUSTOMER_PORTAL_NAV } from "@/config/customer-portal-routes";
import { SETTINGS_NAV_LIVE } from "@/config/settings-nav";
import type { PortalSearchGroup } from "@/components/layout/nav-types";
import { navIconForId } from "@/lib/layout/nav-icons";

export function buildAdminSearchNav(): PortalSearchGroup[] {
  return [
    ...ADMIN_PORTAL_NAV_GROUPS.map((group) => ({
      title: group.label,
      items: group.items.map((item) => ({
        title: item.label,
        href: item.href,
        icon: navIconForId(item.id),
      })),
    })),
    {
      title: "Settings pages",
      items: SETTINGS_NAV_LIVE.map((item) => ({
        title: item.label,
        href: item.href,
        icon: item.icon,
      })),
    },
  ];
}

export function buildCustomerSearchNav(): PortalSearchGroup[] {
  return [
    {
      title: "Portal",
      items: CUSTOMER_PORTAL_NAV.map((item) => ({
        title: item.label,
        href: item.href,
        icon: navIconForId(item.id),
      })),
    },
  ];
}
