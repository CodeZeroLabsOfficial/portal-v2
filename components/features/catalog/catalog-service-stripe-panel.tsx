"use client";

import * as React from "react";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { FormServerError } from "@/components/shared/form-server-error";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { catalogStripeSyncBadgeDisplay } from "@/lib/catalog/status-badges";
import { cn } from "@/lib/utils";
import { activateCatalogServiceAction } from "@/server/actions/catalog-services";
import type { CatalogServiceRecord } from "@/types/catalog-service";

const ghostButtonClassName =
  "gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground";

function formatStripeSyncedAt(ms: number | undefined): string | null {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return null;
  try {
    return new Date(ms).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return null;
  }
}

export interface CatalogServiceStripePanelProps {
  service: CatalogServiceRecord;
  disabled?: boolean;
}

export function CatalogServiceStripePanel({
  service,
  disabled = false,
}: CatalogServiceStripePanelProps) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    setBusy(false);
  }, [service.id]);

  const stripeDisplay = catalogStripeSyncBadgeDisplay(
    service.stripeProductId,
    service.stripeSyncedAt,
  );
  const isLinked = Boolean(service.stripeProductId?.trim());
  const lastSyncedLabel = formatStripeSyncedAt(service.stripeSyncedAt);
  const isDraft = service.status === "draft";
  const isArchived = service.status === "archived";
  const actionsDisabled = disabled || busy || isArchived;

  async function runStripeAction(
    fn: () => Promise<{ ok: boolean; message?: string }>,
    successMessage: string,
  ) {
    setError(null);
    setBusy(true);
    try {
      const result = await fn();
      if (!result.ok) {
        setError(result.message ?? "Something went wrong.");
        return;
      }
      toast.success(successMessage);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Label>Stripe</Label>
              <StatusBadge label={stripeDisplay.label} variant={stripeDisplay.variant} />
            </div>
            {isLinked ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(ghostButtonClassName, "shrink-0")}
                disabled={actionsDisabled}
                aria-label="Open in Stripe"
                onClick={() =>
                  window.open(
                    `https://dashboard.stripe.com/products/${service.stripeProductId?.trim()}`,
                    "_blank",
                  )
                }
              >
                <ExternalLink className="size-4 shrink-0" aria-hidden />
                Open
              </Button>
            ) : null}
          </div>
          {lastSyncedLabel ? (
            <p className="text-muted-foreground text-xs">Last synced {lastSyncedLabel}</p>
          ) : isLinked ? (
            <p className="text-muted-foreground text-xs">
              Linked to Stripe. Save the service to push price changes.
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">
              Save the service, then activate to create a Stripe product.
            </p>
          )}
        </div>

        {isDraft && !isArchived ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={ghostButtonClassName}
              disabled={actionsDisabled}
              onClick={() =>
                void runStripeAction(
                  () => activateCatalogServiceAction(service.id),
                  "Service activated and synced to Stripe.",
                )
              }
            >
              {busy ? (
                <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-4 shrink-0" aria-hidden />
              )}
              Activate & sync
            </Button>
          </div>
        ) : null}

        <FormServerError message={error} />
      </div>
    </div>
  );
}
