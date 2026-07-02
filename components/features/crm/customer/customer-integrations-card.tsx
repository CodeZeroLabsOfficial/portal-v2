"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ExternalLink, Loader2, RefreshCw } from "lucide-react";

import { FormServerError } from "@/components/shared/form-server-error";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  linkStripeCustomerIdAction,
  pullStripeCustomerProfileAction
} from "@/server/actions/customers-crm";
import type { CustomerActivityRecord, CustomerRecord } from "@/types/customer";

const ghostButtonClassName = "gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground";

function customerStripeLastSyncedAt(
  customer: CustomerRecord,
  activities: CustomerActivityRecord[]
): number | null {
  if (customer.stripeSyncedAt && Number.isFinite(customer.stripeSyncedAt)) {
    return customer.stripeSyncedAt;
  }
  let latest = 0;
  for (const activity of activities) {
    if (activity.type === "stripe_sync" && activity.createdAt > latest) {
      latest = activity.createdAt;
    }
  }
  return latest > 0 ? latest : null;
}

export interface CustomerIntegrationsCardProps {
  customer: CustomerRecord;
  activities: CustomerActivityRecord[];
}

export function CustomerIntegrationsCard({ customer, activities }: CustomerIntegrationsCardProps) {
  const router = useRouter();
  const [stripeIdDraft, setStripeIdDraft] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setStripeIdDraft("");
    setBusy(false);
    setError(null);
  }, [customer.id]);

  const stripeLastSyncedAt = React.useMemo(
    () => customerStripeLastSyncedAt(customer, activities),
    [customer, activities]
  );
  const isLinked = Boolean(customer.stripeCustomerId?.trim());

  async function handleLinkStripe() {
    setError(null);
    setBusy(true);
    try {
      const res = await linkStripeCustomerIdAction(customer.id, stripeIdDraft);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setStripeIdDraft("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleResyncStripe() {
    setError(null);
    setBusy(true);
    try {
      const res = await pullStripeCustomerProfileAction(customer.id);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-border/80 bg-card/80 shadow-sm">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="text-muted-foreground size-5" aria-hidden />
          Integrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>Stripe</Label>
            {isLinked ? (
              <StatusBadge label="Linked" variant="success" />
            ) : (
              <StatusBadge label="Not linked" variant="secondary" />
            )}
          </div>
          {stripeLastSyncedAt ? (
            <p className="text-muted-foreground text-xs">
              Last synced{" "}
              {new Date(stripeLastSyncedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short"
              })}
            </p>
          ) : !isLinked ? (
            <p className="text-muted-foreground text-xs">
              Link a Stripe customer id to sync subscriptions and invoices.
            </p>
          ) : null}
        </div>

        {isLinked ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={ghostButtonClassName}
              disabled={busy}
              onClick={() =>
                window.open(
                  `https://dashboard.stripe.com/customers/${customer.stripeCustomerId?.trim()}`,
                  "_blank"
                )
              }>
              <ExternalLink className="size-4 shrink-0" aria-hidden />
              Open in Stripe
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={ghostButtonClassName}
              disabled={busy}
              onClick={() => void handleResyncStripe()}>
              {busy ? (
                <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-4 shrink-0" aria-hidden />
              )}
              Resync Stripe
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              value={stripeIdDraft}
              onChange={(e) => setStripeIdDraft(e.target.value)}
              placeholder="cus_..."
              disabled={busy}
              aria-label="Stripe customer id"
            />
            <Button
              type="button"
              size="sm"
              disabled={busy || !stripeIdDraft.trim()}
              onClick={() => void handleLinkStripe()}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Link Stripe customer
            </Button>
          </div>
        )}

        <FormServerError message={error} />
      </CardContent>
    </Card>
  );
}
