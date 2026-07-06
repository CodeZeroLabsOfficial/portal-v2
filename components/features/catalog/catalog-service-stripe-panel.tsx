"use client";

import * as React from "react";
import { Copy, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { FormServerError } from "@/components/shared/form-server-error";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { resolveCatalogServiceTermLookupKey } from "@/lib/catalog/service-slug";
import { catalogStripeSyncBadgeDisplay } from "@/lib/catalog/status-badges";
import {
  activateCatalogServiceAction,
  syncCatalogServiceStripeAction,
} from "@/server/actions/catalog-services";
import type { CatalogServiceRecord, CatalogServiceTerm } from "@/types/catalog-service";

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

function stripeTermLabel(service: CatalogServiceRecord, term: CatalogServiceTerm): string {
  if (service.billingType === "one_off") return "One-off";
  if (service.pricingModel === "by_term") {
    if (term.months === 12) return "12-month";
    if (term.months === 24) return "24-month";
    return term.months ? `${term.months}-month` : "Term";
  }
  return service.billingType === "recurring" ? "Monthly" : "Flat";
}

function resolvePreviewLookupKey(
  service: CatalogServiceRecord,
  term: CatalogServiceTerm,
  termIndex: number,
  lookupPreviewKeys?: string[],
): string {
  const stored = term.lookupKey?.trim();
  if (stored) return stored;
  if (lookupPreviewKeys?.[termIndex]) return lookupPreviewKeys[termIndex];
  return resolveCatalogServiceTermLookupKey(service, term);
}

async function copyToClipboard(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  } catch {
    toast.error(`Could not copy ${label.toLowerCase()}.`);
  }
}

export interface CatalogServiceStripePanelProps {
  service: CatalogServiceRecord;
  /** Live lookup keys from the Overview form (unsaved draft). */
  lookupPreviewKeys?: string[];
  disabled?: boolean;
}

export function CatalogServiceStripePanel({
  service,
  lookupPreviewKeys,
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

  const priceRows = service.terms.map((term, index) => ({
    id: `${term.months ?? "flat"}-${index}`,
    label: stripeTermLabel(service, term),
    lookupKey: resolvePreviewLookupKey(service, term, index, lookupPreviewKeys),
    priceId: term.stripePriceId?.trim() || "—",
  }));

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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>Stripe</Label>
            <StatusBadge label={stripeDisplay.label} variant={stripeDisplay.variant} />
          </div>
          {lastSyncedLabel ? (
            <p className="text-muted-foreground text-xs">Last synced {lastSyncedLabel}</p>
          ) : isLinked ? (
            <p className="text-muted-foreground text-xs">
              Linked to Stripe. Re-sync after changing prices on the Overview tab.
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">
              Save the service on Overview, then activate to create a Stripe product.
            </p>
          )}
        </div>

        {isLinked ? (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">Product ID</p>
            <div className="flex items-center gap-2">
              <code className="bg-muted min-w-0 flex-1 truncate rounded-md px-2 py-1.5 font-mono text-xs">
                {service.stripeProductId}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 shrink-0"
                disabled={actionsDisabled}
                aria-label="Copy product ID"
                onClick={() => void copyToClipboard(service.stripeProductId ?? "", "Product ID")}
              >
                <Copy className="size-3.5" aria-hidden />
              </Button>
            </div>
          </div>
        ) : null}

        {priceRows.length > 0 ? (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">Prices</p>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Term</TableHead>
                    <TableHead>Lookup key</TableHead>
                    <TableHead>Price ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap">{row.label}</TableCell>
                      <TableCell className="max-w-[10rem] truncate font-mono text-xs">
                        {row.lookupKey}
                      </TableCell>
                      <TableCell className="max-w-[8rem] truncate font-mono text-xs">
                        {row.priceId}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {isLinked ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={ghostButtonClassName}
              disabled={actionsDisabled}
              onClick={() =>
                window.open(
                  `https://dashboard.stripe.com/products/${service.stripeProductId?.trim()}`,
                  "_blank",
                )
              }
            >
              <ExternalLink className="size-4 shrink-0" aria-hidden />
              Open in Stripe
            </Button>
          ) : null}
          {isDraft && !isArchived ? (
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
          ) : null}
          {isLinked && service.status === "active" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={ghostButtonClassName}
              disabled={actionsDisabled}
              onClick={() =>
                void runStripeAction(
                  () => syncCatalogServiceStripeAction(service.id),
                  "Stripe prices re-synced.",
                )
              }
            >
              {busy ? (
                <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-4 shrink-0" aria-hidden />
              )}
              Resync Stripe
            </Button>
          ) : null}
        </div>

        <FormServerError message={error} />
      </div>
    </div>
  );
}
