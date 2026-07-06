"use client";

import * as React from "react";
import { ExternalLink, ListChecks, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { PageBackButton } from "@/components/shared/page-back-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import {
  catalogAvailableTermMonths,
  catalogBillingLabel,
  catalogHeroPriceLabel,
  catalogPricingDetailLines,
  catalogPricingModelLabel,
  catalogServiceTypeLabel,
  formatCatalogStripeSyncedAt,
  formatCatalogTableDate
} from "@/lib/catalog/display";
import {
  catalogServiceStatusBadgeDisplay,
  catalogStripeSyncBadgeDisplay
} from "@/lib/catalog/status-badges";
import {
  saveAndActivateCatalogServiceAction,
  saveAndSyncCatalogServiceStripeAction
} from "@/server/actions/catalog-services";
import type { CatalogServiceRecord, CatalogServiceTermMonths } from "@/types/catalog-service";
import { cn } from "@/lib/utils";

function buildSavePayload(service: CatalogServiceRecord) {
  const term12 =
    service.terms.find((t) => t.months === 12)?.monthlyAmountMinor ?? 0;
  const term24 =
    service.terms.find((t) => t.months === 24)?.monthlyAmountMinor ?? 0;

  return {
    serviceId: service.id,
    name: service.name.trim(),
    description: service.description?.trim() || undefined,
    currency: service.currency,
    includedUsers: service.includedUsers,
    includedLocations: service.includedLocations,
    includedAdmins: service.includedAdmins,
    monthlyCost12Minor: term12,
    monthlyCost24Minor: term24,
    ...(typeof service.upfrontCost12Minor === "number"
      ? { upfrontCost12Minor: service.upfrontCost12Minor }
      : {}),
    features: service.features
  };
}

function renderPricingDetail(value: string | string[]) {
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-0.5">
        {value.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    );
  }
  return value;
}

interface CatalogServiceSpecRow {
  key: string;
  value: React.ReactNode;
}

function buildSpecRows(service: CatalogServiceRecord): CatalogServiceSpecRow[] {
  const status = catalogServiceStatusBadgeDisplay(service.status);
  const stripe = catalogStripeSyncBadgeDisplay(
    service.stripeProductId,
    service.stripeSyncedAt
  );
  const isPlan = service.serviceType !== "addon";

  return [
    {
      key: "Status",
      value: <StatusBadge label={status.label} variant={status.variant} />
    },
    { key: "Type", value: catalogServiceTypeLabel(service) },
    { key: "Billing", value: catalogBillingLabel(service) },
    { key: "Pricing model", value: catalogPricingModelLabel(service) },
    { key: "Price", value: renderPricingDetail(catalogPricingDetailLines(service)) },
    { key: "Slug", value: service.slug },
    ...(isPlan
      ? [
          { key: "Users", value: String(service.includedUsers) },
          { key: "Locations", value: String(service.includedLocations) },
          { key: "Admins", value: String(service.includedAdmins) }
        ]
      : []),
    {
      key: "Stripe",
      value: <StatusBadge label={stripe.label} variant={stripe.variant} />
    },
    {
      key: "Product ID",
      value: service.stripeProductId?.trim() ? (
        <span className="font-mono text-xs">{service.stripeProductId}</span>
      ) : (
        "—"
      )
    },
    { key: "Last sync", value: formatCatalogStripeSyncedAt(service.stripeSyncedAt) },
    { key: "Updated", value: formatCatalogTableDate(service.updatedAt) }
  ];
}

export interface CatalogServiceDetailViewProps {
  service: CatalogServiceRecord;
}

export function CatalogServiceDetailView({ service }: CatalogServiceDetailViewProps) {
  const router = useRouter();
  const availableTerms = catalogAvailableTermMonths(service);
  const defaultTerm = availableTerms[0] ?? 12;
  const [selectedTermMonths, setSelectedTermMonths] =
    React.useState<CatalogServiceTermMonths>(defaultTerm);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const isPlan = service.serviceType !== "addon";
  const isByTerm = service.pricingModel === "by_term" && availableTerms.length > 0;
  const statusDisplay = catalogServiceStatusBadgeDisplay(service.status);
  const stripeDisplay = catalogStripeSyncBadgeDisplay(
    service.stripeProductId,
    service.stripeSyncedAt
  );
  const readOnly = service.status === "archived" || busy;
  const specRows = buildSpecRows(service);

  const metaParts = [catalogBillingLabel(service), catalogServiceTypeLabel(service)].filter(
    (part) => part !== "—"
  );

  async function runAction(fn: () => Promise<{ ok: boolean; message?: string }>) {
    setBusy(true);
    setMessage(null);
    const res = await fn();
    setBusy(false);
    if (!res.ok) {
      setMessage(res.message ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageBackButton href="/admin/services" label="Services" />

      {message ? <p className="text-destructive text-sm">{message}</p> : null}

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-6">
          <div className="space-y-4">
            <Typography variant="h1" className="text-3xl lg:text-4xl">
              {service.name}
            </Typography>

            <p className="text-muted-foreground max-w-xl text-sm">
              {service.description?.trim() || "—"}
            </p>

            {metaParts.length > 0 ? (
              <p className="text-muted-foreground text-sm">{metaParts.join(" · ")}</p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={statusDisplay.label} variant={statusDisplay.variant} />
              <StatusBadge label={stripeDisplay.label} variant={stripeDisplay.variant} />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <p className="text-2xl font-bold sm:text-3xl">
                {catalogHeroPriceLabel(
                  service,
                  isByTerm ? selectedTermMonths : undefined
                )}
              </p>

              {isByTerm ? (
                <div className="flex items-center gap-3">
                  <p className="text-muted-foreground text-sm">Term</p>
                  <div className="flex gap-2">
                    {availableTerms.map((months) => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setSelectedTermMonths(months)}
                        className={cn(
                          "focus-visible:ring-ring rounded-full border px-3 py-1 text-sm transition-colors focus-visible:ring-1 focus-visible:outline-none",
                          selectedTermMonths === months
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                        aria-pressed={selectedTermMonths === months}>
                        {months} mo
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {service.status === "draft" ? (
              <Button
                type="button"
                className="rounded-full"
                disabled={readOnly}
                onClick={() =>
                  void runAction(() =>
                    saveAndActivateCatalogServiceAction(buildSavePayload(service))
                  )
                }>
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Activate & sync
              </Button>
            ) : null}

            {service.status === "active" ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  disabled={readOnly}
                  onClick={() =>
                    void runAction(() =>
                      saveAndSyncCatalogServiceStripeAction(buildSavePayload(service))
                    )
                  }>
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <RefreshCw className="size-4" aria-hidden />
                  )}
                  Resync Stripe
                </Button>
                {service.stripeProductId?.trim() ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    disabled={busy}
                    onClick={() =>
                      window.open(
                        `https://dashboard.stripe.com/products/${service.stripeProductId}`,
                        "_blank"
                      )
                    }>
                    <ExternalLink className="size-4" aria-hidden />
                    Open in Stripe
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t pt-6 lg:border-t-0 lg:pt-0 lg:pl-8">
          <Typography variant="h2" className="text-xl">
            Service details
          </Typography>
          <Table className="mt-4">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground h-auto py-3">Spec</TableHead>
                <TableHead className="text-muted-foreground h-auto py-3">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specRows.map((row) => (
                <TableRow key={row.key} className="border-border">
                  <TableCell className="text-muted-foreground py-3">{row.key}</TableCell>
                  <TableCell className="text-foreground py-3 text-sm whitespace-normal">
                    {row.value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {isPlan ? (
        <div className="space-y-3">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <ListChecks className="size-3.5" aria-hidden />
            Included features
            {service.features.length > 0 ? (
              <span className="normal-case tracking-normal text-muted-foreground/80">
                ({service.features.length})
              </span>
            ) : null}
          </p>
          {service.features.length === 0 ? (
            <p className="text-muted-foreground text-sm">No features listed.</p>
          ) : (
            <ul className="text-foreground space-y-1 text-sm">
              {service.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
