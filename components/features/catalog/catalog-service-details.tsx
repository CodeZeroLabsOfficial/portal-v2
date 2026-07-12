"use client";

import * as React from "react";

import { Separator } from "@/components/ui/separator";
import { catalogCategoryLabel } from "@/lib/catalog/categories";
import {
  catalogAvailableTermMonths,
  catalogBillingLabel,
  catalogHeroPriceLabel,
  catalogPricingModelLabel,
  catalogServiceTypeLabel,
  catalogUpfrontCostLabel,
  formatCatalogTableDate,
} from "@/lib/catalog/display";
import type { CatalogServiceRecord, CatalogServiceTermMonths } from "@/types/catalog-service";
import { cn } from "@/lib/utils";

function buildServiceDetailPrimaryRow(service: CatalogServiceRecord) {
  return [
    { label: "Category", value: catalogCategoryLabel(service.category) },
    { label: "Type", value: catalogServiceTypeLabel(service) },
    { label: "Updated", value: formatCatalogTableDate(service.updatedAt) },
  ];
}

function buildServiceDetailSecondaryRow(service: CatalogServiceRecord) {
  return [
    { label: "Pricing model", value: catalogPricingModelLabel(service) },
    { label: "Billing", value: catalogBillingLabel(service) },
  ];
}

function ServiceDetailInfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export interface CatalogServiceDetailsProps {
  service: CatalogServiceRecord;
}

export function CatalogServiceDetails({ service }: CatalogServiceDetailsProps) {
  const availableTerms = catalogAvailableTermMonths(service);
  const defaultTerm = availableTerms[0] ?? 12;
  const [selectedTermMonths, setSelectedTermMonths] =
    React.useState<CatalogServiceTermMonths>(defaultTerm);

  const isByTerm = service.pricingModel === "by_term" && availableTerms.length > 0;
  const description = service.description?.trim() || "—";
  const primaryRow = buildServiceDetailPrimaryRow(service);
  const secondaryRow = buildServiceDetailSecondaryRow(service);
  const upfrontLabel = catalogUpfrontCostLabel(
    service,
    isByTerm ? selectedTermMonths : undefined,
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 font-semibold">Description</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {primaryRow.map((item) => (
            <ServiceDetailInfoCell key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {secondaryRow.map((item) => (
            <ServiceDetailInfoCell key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-2xl font-bold sm:text-3xl">
            {catalogHeroPriceLabel(service, isByTerm ? selectedTermMonths : undefined)}
          </p>
          {upfrontLabel ? (
            <p className="text-sm">
              Upfront cost <span className="font-semibold">{upfrontLabel}</span>
            </p>
          ) : null}
        </div>

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
