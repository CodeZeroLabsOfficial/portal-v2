import type { SessionUserView } from "@/lib/session-user-view";

export interface PortalNavItemView {
  id: string;
  href: string;
  label: string;
}

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
}
