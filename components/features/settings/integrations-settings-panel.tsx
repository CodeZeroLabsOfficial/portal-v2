import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface IntegrationsSettingsPanelProps {
  /** API key + webhook secret present — mirrors will sync. */
  stripeConnected: boolean;
}

export function IntegrationsSettingsPanel({ stripeConnected }: IntegrationsSettingsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe</CardTitle>
        <CardAction>
          <div className="flex flex-col items-end gap-2">
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
        </CardAction>
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
  );
}
