import { CreditCard, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface IntegrationsSettingsPanelProps {
  /** API key + webhook secret present — mirrors will sync. */
  stripeConnected: boolean;
}

export function IntegrationsSettingsPanel({ stripeConnected }: IntegrationsSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Connect external services used for billing and payment sync."
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#635bff]/15 text-[#635bff]">
              <CreditCard className="h-6 w-6" aria-hidden />
            </div>
            <div className="space-y-1">
              <CardTitle>Stripe</CardTitle>
              <CardDescription>
                Sync customers, subscriptions, invoices, and payments from Stripe.
              </CardDescription>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Badge variant={stripeConnected ? "success" : "secondary"} className="gap-1.5">
              <span
                className={cn(
                  "inline-flex h-2 w-2 rounded-full",
                  stripeConnected ? "bg-emerald-500" : "bg-muted-foreground",
                )}
                aria-hidden
              />
              {stripeConnected ? "Connected" : "Not configured"}
            </Badge>
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Open Stripe Dashboard
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        </CardHeader>
        {!stripeConnected ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">STRIPE_SECRET_KEY</code> and{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">STRIPE_WEBHOOK_SECRET</code> to your
              deployment environment.
            </p>
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}
