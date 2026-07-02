import type { PortalNavItemView } from "@/components/layout/nav-types";

export interface CustomerPortalNavItem {
  id: "dashboard" | "customer";
  href: "/dashboard" | "/customer";
  label: string;
}

export const CUSTOMER_PORTAL_NAV: CustomerPortalNavItem[] = [
  { id: "dashboard", href: "/dashboard", label: "Overview" },
  { id: "customer", href: "/customer", label: "Billing" },
];

export function toCustomerPortalNavViews(): PortalNavItemView[] {
  return CUSTOMER_PORTAL_NAV.map((item) => ({
    id: item.id,
    href: item.href,
    label: item.label,
  }));
}
