"use client";

import * as React from "react";
import { Edit3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CatalogServiceEditSheet } from "@/components/features/catalog/catalog-service-edit-sheet";
import { CatalogServiceFeaturesCard } from "@/components/features/catalog/catalog-service-features-card";
import { CatalogServiceSummaryCard } from "@/components/features/catalog/catalog-service-summary-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import {
  catalogServiceStatusBadgeDisplay,
  catalogStripeSyncBadgeDisplay,
} from "@/lib/catalog/status-badges";
import { deleteCatalogServiceAction } from "@/server/actions/catalog-services";
import type { CatalogServiceRecord } from "@/types/catalog-service";
import { cn } from "@/lib/utils";

export interface CatalogServiceDetailViewProps {
  service: CatalogServiceRecord;
}

export function CatalogServiceDetailView({ service }: CatalogServiceDetailViewProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const isPlan = service.serviceType !== "addon";
  const isArchived = service.status === "archived";
  const statusDisplay = catalogServiceStatusBadgeDisplay(service.status);
  const stripeDisplay = catalogStripeSyncBadgeDisplay(
    service.stripeProductId,
    service.stripeSyncedAt,
  );

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteCatalogServiceAction(service.id);
    setIsDeleting(false);

    if (!result.ok) {
      toast.error(result.message);
      throw new Error(result.message);
    }

    toast.success("Service deleted.");
    router.push("/admin/services");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <Typography variant="h1" className="text-xl tracking-tight lg:text-2xl">
            {service.name}
          </Typography>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={statusDisplay.label} variant={statusDisplay.variant} />
            <StatusBadge label={stripeDisplay.label} variant={stripeDisplay.variant} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" onClick={() => setEditOpen(true)} disabled={isArchived}>
            <Edit3 className="size-4" aria-hidden />
            <span className="hidden lg:inline">Edit</span>
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => setDeleteOpen(true)}
            disabled={isDeleting}
            aria-label="Delete service"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-6">
        <div className={cn(isPlan ? "lg:col-span-4" : "lg:col-span-6")}>
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

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete service"
        description="Delete this service permanently? It will be removed from the catalogue. Linked Stripe product will be deactivated if present; existing subscriptions are not changed."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
