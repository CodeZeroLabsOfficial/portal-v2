import type { LucideIcon } from "lucide-react";

import type { SessionUserView } from "@/lib/auth/session-user-view";

export interface PortalNavItemView {
  id: string;
  href: string;
  label: string;
}

export interface PortalSearchItem {
  title: string;
  href: string;
  icon?: LucideIcon;
}

export interface PortalSearchGroup {
  title: string;
  items: PortalSearchItem[];
}

export type PortalSearchScope = "admin" | "customer";

export interface PortalShellNav {
  items: PortalNavItemView[];
  footerItems: PortalNavItemView[];
}

export interface PortalShellBrand {
  label: string;
  href: string;
}

export interface PortalShellProps extends PortalShellNav {
  user: SessionUserView;
  brand: PortalShellBrand;
  searchScope: PortalSearchScope;
}
