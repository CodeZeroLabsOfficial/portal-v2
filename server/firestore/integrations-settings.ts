import { asNumber, asString } from "@/lib/firestore/coerce";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { COLLECTIONS } from "@/server/firestore/collections";
import type { PortalIntegrationsSettings } from "@/types/integrations";

export const INTEGRATIONS_SETTINGS_DOC_ID = "integrations";

function parseIntegrations(data: Record<string, unknown> | undefined): PortalIntegrationsSettings {
  return {
    stripePublishableKey: asString(data?.stripePublishableKey),
    webhookUrl: asString(data?.webhookUrl),
    updatedAt: asNumber(data?.updatedAt),
  };
}

export async function getPortalIntegrationsSettings(): Promise<PortalIntegrationsSettings | null> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return null;
  }

  const snap = await db
    .collection(COLLECTIONS.appSettings)
    .doc(INTEGRATIONS_SETTINGS_DOC_ID)
    .get();

  if (!snap.exists) {
    return {};
  }

  return parseIntegrations(snap.data() as Record<string, unknown>);
}
