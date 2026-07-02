import type { PortalAppearanceSettings } from "@/types/appearance";
import { asNumber, asString } from "@/lib/firestore/coerce";
import { DEFAULT_BRANDING_FONT, isBrandingFontId } from "@/lib/fonts-config";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { COLLECTIONS } from "@/server/firestore/collections";

export const APPEARANCE_SETTINGS_DOC_ID = "branding";

const DEFAULT_PORTAL_NAME = "Code Zero Labs";

function parseAppearance(data: Record<string, unknown> | undefined): PortalAppearanceSettings {
  const fontFamily = asString(data?.fontFamily);
  return {
    portalName: asString(data?.portalName) ?? DEFAULT_PORTAL_NAME,
    supportEmail: asString(data?.supportEmail),
    primaryColorHex: asString(data?.primaryColorHex),
    fontFamily: fontFamily && isBrandingFontId(fontFamily) ? fontFamily : DEFAULT_BRANDING_FONT,
    logoUrl: asString(data?.logoUrl),
    faviconUrl: asString(data?.faviconUrl),
    updatedAt: asNumber(data?.updatedAt),
  };
}

export async function getPortalAppearanceSettings(): Promise<PortalAppearanceSettings | null> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return null;
  }

  const snap = await db
    .collection(COLLECTIONS.appSettings)
    .doc(APPEARANCE_SETTINGS_DOC_ID)
    .get();

  if (!snap.exists) {
    return { portalName: DEFAULT_PORTAL_NAME, fontFamily: DEFAULT_BRANDING_FONT };
  }

  return parseAppearance(snap.data() as Record<string, unknown>);
}
