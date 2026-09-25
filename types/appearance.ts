import type { ThemeColorId } from "@/lib/themes";

/** `app_settings/branding` document (portal appearance / branding). */
export interface PortalAppearanceSettings {
  portalName?: string;
  supportEmail?: string;
  /** Palette id applied as `data-theme-color` and `data-theme-chart-preset`. */
  themeColor?: ThemeColorId;
  logoUrl?: string;
  faviconUrl?: string;
  updatedAt?: number;
}
