"use client";

import * as React from "react";
import { ListChecks, MapPin, Shield, Users } from "lucide-react";

import { PageBackButton } from "@/components/shared/page-back-button";
import { StatusBadge } from "@/components/shared/status-badge";
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
  formatCatalogTableDate
} from "@/lib/catalog/display";
import {
  catalogServiceStatusBadgeDisplay,
  catalogStripeSyncBadgeDisplay
} from "@/lib/catalog/status-badges";
import type { CatalogServiceRecord, CatalogServiceTermMonths } from "@/types/catalog-service";
import { cn } from "@/lib/utils";

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

const ENTITLEMENT_STATS = [
  { key: "users", label: "users", icon: Users, field: "includedUsers" },
  { key: "locations", label: "locations", icon: MapPin, field: "includedLocations" },
  { key: "admins", label: "admins", icon: Shield, field: "includedAdmins" }
] as const;

function buildSpecRows(service: CatalogServiceRecord) {
  return [
    { key: "Type", value: catalogServiceTypeLabel(service) },
    { key: "Billing", value: catalogBillingLabel(service) },
    { key: "Pricing model", value: catalogPricingModelLabel(service) },
    { key: "Price", value: renderPricingDetail(catalogPricingDetailLines(service)) },
    { key: "Updated", value: formatCatalogTableDate(service.updatedAt) }
  ];
}

export interface CatalogServiceDetailViewProps {
  service: CatalogServiceRecord;
}

export function CatalogServiceDetailView({ service }: CatalogServiceDetailViewProps) {
  const availableTerms = catalogAvailableTermMonths(service);
  const defaultTerm = availableTerms[0] ?? 12;
  const [selectedTermMonths, setSelectedTermMonths] =
    React.useState<CatalogServiceTermMonths>(defaultTerm);

  const isPlan = service.serviceType !== "addon";
  const isByTerm = service.pricingModel === "by_term" && availableTerms.length > 0;
  const statusDisplay = catalogServiceStatusBadgeDisplay(service.status);
  const stripeDisplay = catalogStripeSyncBadgeDisplay(
    service.stripeProductId,
    service.stripeSyncedAt
  );
  const specRows = buildSpecRows(service);

  const metaParts = [catalogBillingLabel(service), catalogServiceTypeLabel(service)].filter(
    (part) => part !== "—"
  );

  return (
    <div className="space-y-6">
      <PageBackButton href="/admin/services" label="Services" />

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

            {isPlan ? (
              <div className="grid grid-cols-3 gap-3 text-sm *:space-y-1 *:rounded-md *:border *:p-3 *:text-center">
                {ENTITLEMENT_STATS.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.key}>
                      <p className="text-2xl font-semibold tabular-nums">
                        {service[stat.field]}
                      </p>
                      <p className="text-muted-foreground inline-flex items-center justify-center gap-1">
                        <Icon className="size-4" aria-hidden />
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={statusDisplay.label} variant={statusDisplay.variant} />
              <StatusBadge label={stripeDisplay.label} variant={stripeDisplay.variant} />
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="text-2xl font-bold sm:text-3xl">
              {catalogHeroPriceLabel(service, isByTerm ? selectedTermMonths : undefined)}
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
