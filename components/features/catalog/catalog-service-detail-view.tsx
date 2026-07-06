"use client";

import * as React from "react";
import { Edit3 } from "lucide-react";

import { CatalogServiceEditSheet } from "@/components/features/catalog/catalog-service-edit-sheet";
import { CatalogServiceEntitlementStats } from "@/components/features/catalog/catalog-service-entitlement-stats";
import { CatalogServiceFeaturesCard } from "@/components/features/catalog/catalog-service-features-card";
import { CatalogServiceSummaryCard } from "@/components/features/catalog/catalog-service-summary-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { catalogServiceStatusBadgeDisplay } from "@/lib/catalog/status-badges";
import type { CatalogServiceRecord } from "@/types/catalog-service";
import { cn } from "@/lib/utils";

export interface CatalogServiceDetailViewProps {
  service: CatalogServiceRecord;
}

export function CatalogServiceDetailView({ service }: CatalogServiceDetailViewProps) {
  const [editOpen, setEditOpen] = React.useState(false);

  const isPlan = service.serviceType !== "addon";
  const isArchived = service.status === "archived";
  const statusDisplay = catalogServiceStatusBadgeDisplay(service.status);

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <Typography variant="h1" className="text-xl tracking-tight lg:text-2xl">
            {service.name}
          </Typography>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={statusDisplay.label} variant={statusDisplay.variant} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" onClick={() => setEditOpen(true)} disabled={isArchived}>
            <Edit3 className="size-4" aria-hidden />
            <span className="hidden lg:inline">Edit</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-6">
        <div className={cn("space-y-4", isPlan ? "lg:col-span-4" : "lg:col-span-6")}>
          {isPlan ? <CatalogServiceEntitlementStats service={service} /> : null}
          <CatalogServiceSummaryCard service={service} />
        </div>

        {isPlan ? (
          <div className="lg:col-span-2">
            <CatalogServiceFeaturesCard
              serviceId={service.id}
              initialFeatures={service.features}
              disabled={isArchived}
            />
          </div>
        ) : null}
      </div>

      <CatalogServiceEditSheet service={service} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
