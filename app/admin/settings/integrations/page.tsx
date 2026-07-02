import { IntegrationsSettingsPanel } from "@/components/features/settings/integrations-settings-panel";
import { isStripeApiConfigured, isStripeWebhookConfigured } from "@/lib/stripe/server";

export default function AdminSettingsIntegrationsPage() {
  const stripeConnected = isStripeApiConfigured() && isStripeWebhookConfigured();

  return <IntegrationsSettingsPanel stripeConnected={stripeConnected} />;
}
