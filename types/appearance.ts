import type { ThemeColorId, ThemeDisplayFontId, ThemeFontId } from "@/lib/themes";

/** `app_settings/branding` document (portal appearance / branding). */
export interface PortalAppearanceSettings {
  portalName?: string;
  supportEmail?: string;
  /** Palette id applied as `data-theme-color` and `data-theme-chart-preset`. */
  themeColor?: ThemeColorId;
  /** Body font id applied as `data-theme-font`. `"default"` is DM Sans. */
  font?: ThemeFontId;
  /** Heading font id applied as `data-theme-display-font`. `"default"` is DM Sans. */
  displayFont?: ThemeDisplayFontId;
  logoUrl?: string;
  faviconUrl?: string;
  updatedAt?: number;
}
