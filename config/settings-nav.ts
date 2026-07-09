import type { LucideIcon } from "lucide-react";
import { Bell, Building2, Globe, Palette, Puzzle, User, Users } from "lucide-react";

export interface SettingsNavItem {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_SETTINGS_INTEGRATIONS_HREF = "/admin/settings/integrations";

/** Secondary navigation for `/admin/settings/*` — order matches product IA; Integrations is included here. */
export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { id: "company", href: "/admin/settings/company", label: "Company", icon: Building2 },
  { id: "profile", href: "/admin/settings/profile", label: "Profile", icon: User },
  { id: "appearance", href: "/admin/settings/appearance", label: "Appearance", icon: Palette },
  { id: "notifications", href: "/admin/settings/notifications", label: "Notifications", icon: Bell },
  { id: "team", href: "/admin/settings/team", label: "Team", icon: Users },
  { id: "locality", href: "/admin/settings/locality", label: "Locality", icon: Globe },
  { id: "integrations", href: ADMIN_SETTINGS_INTEGRATIONS_HREF, label: "Integrations", icon: Puzzle },
];

/** Phase 1 live settings — Team and other placeholders stay out of nav until built. */
export const SETTINGS_NAV_LIVE: SettingsNavItem[] = SETTINGS_NAV_ITEMS.filter(
  (item) => item.id !== "team",
);
