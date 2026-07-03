import Link from "next/link";
import { Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ADMIN_SETTINGS_INTEGRATIONS_HREF } from "@/config/settings-nav";

export function StripeIntegrationNotConfiguredAlert() {
  return (
    <Alert>
      <Info aria-hidden />
      <AlertTitle>Stripe integration is not configured</AlertTitle>
      <AlertDescription>
        Configure Stripe under{" "}
        <Link href={ADMIN_SETTINGS_INTEGRATIONS_HREF} className="font-medium text-primary hover:underline">
          Settings → Integrations
        </Link>{" "}
        to collect card details.
      </AlertDescription>
    </Alert>
  );
}

export function StripePublicPaymentsUnavailableAlert() {
  return (
    <Alert>
      <Info aria-hidden />
      <AlertTitle>Online payments are not available yet</AlertTitle>
      <AlertDescription>
        Payment processing has not been set up for this portal. Please contact Code Zero Labs to complete your
        subscription.
      </AlertDescription>
    </Alert>
  );
}
