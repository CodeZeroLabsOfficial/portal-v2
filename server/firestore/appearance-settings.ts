import type { PortalAppearanceSettings } from "@/types/appearance";
import { asNumber, asString } from "@/lib/firestore/coerce";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { DEFAULT_THEME_COLOR, isThemeColorId } from "@/lib/themes";
import { COLLECTIONS } from "@/server/firestore/collections";

export const APPEARANCE_SETTINGS_DOC_ID = "branding";

const DEFAULT_PORTAL_NAME = "Code Zero Labs";

function parseAppearance(data: Record<string, unknown> | undefined): PortalAppearanceSettings {
  const themeColor = asString(data?.themeColor);
  return {
    portalName: asString(data?.portalName) ?? DEFAULT_PORTAL_NAME,
    supportEmail: asString(data?.supportEmail),
    themeColor: themeColor && isThemeColorId(themeColor) ? themeColor : DEFAULT_THEME_COLOR,
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
    return { portalName: DEFAULT_PORTAL_NAME, themeColor: DEFAULT_THEME_COLOR };
  }

  return parseAppearance(snap.data() as Record<string, unknown>);
}
