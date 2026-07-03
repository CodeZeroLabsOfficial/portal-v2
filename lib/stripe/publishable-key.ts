import "server-only";

import { getPortalIntegrationsSettings } from "@/server/firestore/integrations-settings";

/** Stripe publishable key for client card entry — stored in `app_settings/integrations`. */
export async function getStripePublishableKey(): Promise<string | undefined> {
  const settings = await getPortalIntegrationsSettings();
  const key = settings?.stripePublishableKey?.trim();
  return key || undefined;
}
