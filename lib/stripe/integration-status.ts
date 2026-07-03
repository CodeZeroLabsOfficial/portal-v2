import "server-only";

import { getStripePublishableKey } from "@/lib/stripe/publishable-key";
import { isStripeApiConfigured, isStripeWebhookConfigured } from "@/lib/stripe/server";

export interface StripeIntegrationStatus {
  connected: boolean;
  hasSecretKey: boolean;
  hasWebhookSecret: boolean;
  hasPublishableKey: boolean;
}

export async function getStripeIntegrationStatus(): Promise<StripeIntegrationStatus> {
  const hasSecretKey = isStripeApiConfigured();
  const hasWebhookSecret = isStripeWebhookConfigured();
  const hasPublishableKey = Boolean(await getStripePublishableKey());

  return {
    hasSecretKey,
    hasWebhookSecret,
    hasPublishableKey,
    connected: hasSecretKey && hasWebhookSecret && hasPublishableKey,
  };
}
