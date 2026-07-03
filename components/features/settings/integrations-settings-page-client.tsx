"use client";

import * as React from "react";

import { IntegrationsSettingsView } from "@/components/features/settings/integrations-settings-view";
import { StripeConnectSheet } from "@/components/features/settings/stripe-connect-sheet";
import type { StripeIntegrationStatus } from "@/lib/stripe/integration-status";
import type { PortalIntegrationsSettings } from "@/types/integrations";

export interface IntegrationsSettingsPageClientProps {
  initialSettings: PortalIntegrationsSettings;
  initialStripeStatus: StripeIntegrationStatus;
}

export function IntegrationsSettingsPageClient({
  initialSettings,
  initialStripeStatus,
}: IntegrationsSettingsPageClientProps) {
  const [settings, setSettings] = React.useState(initialSettings);
  const [stripeStatus, setStripeStatus] = React.useState(initialStripeStatus);
  const [stripeSheetOpen, setStripeSheetOpen] = React.useState(false);

  React.useEffect(() => {
    setSettings(initialSettings);
    setStripeStatus(initialStripeStatus);
  }, [initialSettings, initialStripeStatus]);

  function handleSaved(next: PortalIntegrationsSettings) {
    setSettings(next);
    setStripeStatus((prev) => ({
      ...prev,
      hasPublishableKey: Boolean(next.stripePublishableKey?.trim()),
      connected:
        prev.hasSecretKey && prev.hasWebhookSecret && Boolean(next.stripePublishableKey?.trim()),
    }));
  }

  return (
    <>
      <IntegrationsSettingsView
        stripeStatus={stripeStatus}
        onConfigureStripe={() => setStripeSheetOpen(true)}
      />
      <StripeConnectSheet
        settings={settings}
        stripeStatus={stripeStatus}
        open={stripeSheetOpen}
        onOpenChange={setStripeSheetOpen}
        onSaved={handleSaved}
      />
    </>
  );
}
