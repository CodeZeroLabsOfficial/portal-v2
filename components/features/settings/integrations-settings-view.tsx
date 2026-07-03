"use client";

import { CheckCircle2, Circle, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFirebasePublicConfig } from "@/lib/env/client-public";
import type { StripeIntegrationStatus } from "@/lib/stripe/integration-status";
import { cn } from "@/lib/utils";

export interface IntegrationsSettingsViewProps {
  stripeStatus: StripeIntegrationStatus;
  onConfigureStripe: () => void;
}

export function IntegrationsSettingsView({ stripeStatus, onConfigureStripe }: IntegrationsSettingsViewProps) {
  const firebaseConnected = Boolean(getFirebasePublicConfig());

  const connections = [
    {
      id: "firebase",
      name: "Firebase",
      detail: "Authentication & Firestore",
      connected: firebaseConnected,
      configurable: false,
    },
    {
      id: "stripe",
      name: "Stripe",
      detail: "Subscriptions, invoices & card payments",
      connected: stripeStatus.connected,
      configurable: true,
    },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {connections.map((connection) => {
          const isStripe = connection.id === "stripe";
          const rowClickable = isStripe;

          return (
            <div
              key={connection.id}
              role={rowClickable ? "button" : undefined}
              tabIndex={rowClickable ? 0 : undefined}
              onClick={rowClickable ? onConfigureStripe : undefined}
              onKeyDown={
                rowClickable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onConfigureStripe();
                      }
                    }
                  : undefined
              }
              className={cn(
                "flex items-center justify-between rounded-lg border p-4",
                rowClickable && "cursor-pointer transition-colors hover:bg-muted/50",
              )}
            >
              <div className="flex items-center gap-3">
                {connection.connected ? (
                  <CheckCircle2 className="size-5 text-emerald-500" aria-hidden />
                ) : (
                  <Circle className="text-muted-foreground size-5" aria-hidden />
                )}
                <div>
                  <p className="text-sm font-medium">{connection.name}</p>
                  <p className="text-muted-foreground text-xs">{connection.detail}</p>
                </div>
              </div>
              {connection.connected ? (
                <Badge variant="success">Connected</Badge>
              ) : isStripe ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfigureStripe();
                  }}
                >
                  <Plus className="size-4" aria-hidden />
                  Add
                </Button>
              ) : (
                <Badge variant="secondary">Not configured</Badge>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
