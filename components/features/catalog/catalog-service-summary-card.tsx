"use client";

import * as React from "react";
import { MapPin, Shield, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  catalogAvailableTermMonths,
  catalogBillingLabel,
  catalogHeroPriceLabel,
  catalogPricingModelLabel,
  catalogServiceTypeLabel,
  formatCatalogTableDate,
} from "@/lib/catalog/display";
import type { CatalogServiceRecord, CatalogServiceTermMonths } from "@/types/catalog-service";
import { cn } from "@/lib/utils";

const PLAN_ENTITLEMENT_STATS = [
  { key: "users", label: "users", icon: Users, field: "includedUsers" as const },
  { key: "locations", label: "locations", icon: MapPin, field: "includedLocations" as const },
  { key: "admins", label: "admins", icon: Shield, field: "includedAdmins" as const },
] as const;

function buildServiceDetailInfoItems(service: CatalogServiceRecord) {
  return [
    { label: "Type", value: catalogServiceTypeLabel(service) },
    { label: "Billing", value: catalogBillingLabel(service) },
    { label: "Pricing model", value: catalogPricingModelLabel(service) },
    { label: "Updated", value: formatCatalogTableDate(service.updatedAt) },
    { label: "Lookup key", value: service.slug || "—" },
    { label: "Currency", value: service.currency.toUpperCase() },
  ];
}

export interface CatalogServiceSummaryCardProps {
  service: CatalogServiceRecord;
}

export function CatalogServiceSummaryCard({ service }: CatalogServiceSummaryCardProps) {
  const availableTerms = catalogAvailableTermMonths(service);
  const defaultTerm = availableTerms[0] ?? 12;
  const [selectedTermMonths, setSelectedTermMonths] =
    React.useState<CatalogServiceTermMonths>(defaultTerm);

  const isPlan = service.serviceType !== "addon";
  const isByTerm = service.pricingModel === "by_term" && availableTerms.length > 0;
  const description = service.description?.trim() || "—";
  const infoItems = buildServiceDetailInfoItems(service);

  return (
    <div className="space-y-4">
      <Card className="py-5">
        <CardContent className="space-y-6 px-5">
          <div className="flex flex-col justify-between space-y-4 lg:flex-row lg:items-center lg:space-y-0">
            <p className="text-muted-foreground max-w-xl text-sm">{description}</p>

            {isPlan ? (
              <div className="grid grid-cols-3 gap-3 text-sm *:space-y-1 *:rounded-md *:border *:p-3 *:text-center">
                {PLAN_ENTITLEMENT_STATS.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.key}>
                      <p className="text-2xl font-semibold tabular-nums">{service[stat.field]}</p>
                      <p className="text-muted-foreground inline-flex items-center justify-center gap-1">
                        <Icon className="size-4" aria-hidden />
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {infoItems.map((item) => (
              <div className="space-y-1" key={item.label}>
                <p className="text-muted-foreground text-sm">{item.label}</p>
                <p className="font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={selectedTermMonths === months}
                >
                  {months} mo
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
