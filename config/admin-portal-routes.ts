export interface AdminPortalNavItem {
  id:
    | "dashboard"
    | "financials"
    | "customers"
    | "opportunities"
    | "accounts"
    | "subscriptions"
    | "services"
    | "tasks"
    | "reports"
    | "proposals"
    | "templates"
    | "settings";
  href:
    | "/admin"
    | "/admin/financials"
    | "/admin/customers"
    | "/admin/opportunities"
    | "/admin/accounts"
    | "/admin/subscriptions"
    | "/admin/services"
    | "/admin/tasks"
    | "/admin/reports"
    | "/admin/proposals"
    | "/admin/templates"
    | "/admin/settings";
  label: string;
}

export type AdminPortalNavGroupId = "overview" | "sales" | "operations" | "configuration";

export interface AdminPortalNavGroup {
  id: AdminPortalNavGroupId;
  label: string;
  items: AdminPortalNavItem[];
}

export const ADMIN_PORTAL_NAV_GROUPS: AdminPortalNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { id: "dashboard", href: "/admin", label: "Dashboard" },
      { id: "financials", href: "/admin/financials", label: "Financials" },
      { id: "reports", href: "/admin/reports", label: "Reports" },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    items: [
      { id: "opportunities", href: "/admin/opportunities", label: "Pipeline" },
      { id: "proposals", href: "/admin/proposals", label: "Proposals" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { id: "accounts", href: "/admin/accounts", label: "Accounts" },
      { id: "customers", href: "/admin/customers", label: "Customers" },
      { id: "subscriptions", href: "/admin/subscriptions", label: "Subscriptions" },
      { id: "tasks", href: "/admin/tasks", label: "Tasks" },
    ],
  },
  {
    id: "configuration",
    label: "Configuration",
    items: [
      { id: "templates", href: "/admin/templates", label: "Templates" },
      { id: "services", href: "/admin/services", label: "Services" },
      { id: "settings", href: "/admin/settings", label: "Settings" },
    ],
  },
];

/** Flat list of all admin nav items — useful for search and lookups. */
export const ADMIN_PORTAL_NAV: AdminPortalNavItem[] = ADMIN_PORTAL_NAV_GROUPS.flatMap(
  (group) => group.items,
);

export function isAdminNavActive(item: AdminPortalNavItem, pathname: string): boolean {
  const normalized = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const { href, id } = item;
  if (href === "/admin") {
    return normalized === "/admin";
  }
  if (id === "proposals") {
    if (normalized === "/admin/proposals") return true;
    if (!normalized.startsWith("/admin/proposals/")) return false;
    if (normalized.startsWith("/admin/proposals/templates")) return false;
    return true;
  }
  return normalized === href || normalized.startsWith(`${href}/`);
}
