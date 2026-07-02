import type { BrandingFontId } from "@/lib/fonts-config";

/** `app_settings/branding` document (portal appearance / branding). */
export interface PortalAppearanceSettings {
  portalName?: string;
  supportEmail?: string;
  primaryColorHex?: string;
  fontFamily?: BrandingFontId;
  logoUrl?: string;
  faviconUrl?: string;
  updatedAt?: number;
}
