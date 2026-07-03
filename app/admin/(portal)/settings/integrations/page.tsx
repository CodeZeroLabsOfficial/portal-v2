import { redirect } from "next/navigation";

import { IntegrationsSettingsPageClient } from "@/components/features/settings/integrations-settings-page-client";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getStripeIntegrationStatus } from "@/lib/stripe/integration-status";
import { getPortalIntegrationsSettings } from "@/server/firestore/integrations-settings";

export default async function AdminSettingsIntegrationsPage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/settings/integrations");
  }

  const [settings, stripeStatus] = await Promise.all([
    getPortalIntegrationsSettings(),
    getStripeIntegrationStatus(),
  ]);

  if (settings === null) {
    return (
      <p className="text-destructive text-sm">
        Integration settings could not be loaded. Check that Firebase Admin is configured.
      </p>
    );
  }

  return (
    <IntegrationsSettingsPageClient initialSettings={settings} initialStripeStatus={stripeStatus} />
  );
}
