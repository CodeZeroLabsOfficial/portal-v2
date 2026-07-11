"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";

import { CatalogServiceDetails } from "@/components/features/catalog/catalog-service-details";
import { CatalogServiceEditSheet } from "@/components/features/catalog/catalog-service-edit-sheet";
import { CatalogServiceFeaturesCard } from "@/components/features/catalog/catalog-service-features-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { catalogServiceStatusBadgeDisplay } from "@/lib/catalog/status-badges";
import type { CatalogServiceRecord } from "@/types/catalog-service";

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
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/admin/services" aria-label="Back to services">
            <ChevronLeft />
          </Link>
        </Button>
        <Button type="button" onClick={() => setEditOpen(true)} disabled={isArchived}>
          <Pencil />
          Edit
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">{service.name}</CardTitle>
            <StatusBadge label={statusDisplay.label} variant={statusDisplay.variant} />
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <CatalogServiceDetails service={service} />
          </CardContent>
        </Card>

        {isPlan ? <CatalogServiceFeaturesCard features={service.features} /> : null}
      </div>

      <CatalogServiceEditSheet service={service} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
