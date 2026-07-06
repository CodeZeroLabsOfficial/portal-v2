"use client";

import * as React from "react";
import { Edit3, MapPin, Shield, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CatalogServiceEditSheet } from "@/components/features/catalog/catalog-service-edit-sheet";
import { CatalogServiceFeaturesCard } from "@/components/features/catalog/catalog-service-features-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageBackButton } from "@/components/shared/page-back-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import {
  catalogAvailableTermMonths,
  catalogBillingLabel,
  catalogHeroPriceLabel,
  catalogPricingModelLabel,
  catalogServiceTypeLabel,
  formatCatalogTableDate,
} from "@/lib/catalog/display";
import {
  catalogServiceStatusBadgeDisplay,
  catalogStripeSyncBadgeDisplay,
} from "@/lib/catalog/status-badges";
import { deleteCatalogServiceAction } from "@/server/actions/catalog-services";
import type { CatalogServiceRecord, CatalogServiceTermMonths } from "@/types/catalog-service";
import { cn } from "@/lib/utils";

const ENTITLEMENT_STATS = [
  { key: "users", label: "Users", icon: Users, field: "includedUsers" as const },
  { key: "locations", label: "Locations", icon: MapPin, field: "includedLocations" as const },
  { key: "admins", label: "Admins", icon: Shield, field: "includedAdmins" as const },
];

export interface CatalogServiceDetailViewProps {
  service: CatalogServiceRecord;
}

export function CatalogServiceDetailView({ service }: CatalogServiceDetailViewProps) {
  const router = useRouter();
  const availableTerms = catalogAvailableTermMonths(service);
  const defaultTerm = availableTerms[0] ?? 12;
  const [selectedTermMonths, setSelectedTermMonths] =
    React.useState<CatalogServiceTermMonths>(defaultTerm);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const isPlan = service.serviceType !== "addon";
  const isByTerm = service.pricingModel === "by_term" && availableTerms.length > 0;
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
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <PageBackButton href="/admin/services" label="Services" />

          <div className="min-w-0 space-y-2">
            <Typography variant="h1" className="text-xl tracking-tight lg:text-2xl">
              {service.name}
            </Typography>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={statusDisplay.label} variant={statusDisplay.variant} />
              <StatusBadge label={stripeDisplay.label} variant={stripeDisplay.variant} />
            </div>

            <div className="text-muted-foreground inline-flex flex-col gap-2 text-sm lg:flex-row lg:gap-4">
              <div>
                <span className="text-foreground font-semibold">Type :</span>{" "}
                {catalogServiceTypeLabel(service)}
              </div>
              <div>
                <span className="text-foreground font-semibold">Billing :</span>{" "}
                {catalogBillingLabel(service)}
              </div>
              <div>
                <span className="text-foreground font-semibold">Pricing model :</span>{" "}
                {catalogPricingModelLabel(service)}
              </div>
              <div>
                <span className="text-foreground font-semibold">Updated :</span>{" "}
                {formatCatalogTableDate(service.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            onClick={() => setEditOpen(true)}
            disabled={isArchived}
          >
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
        <div className={cn("space-y-4", isPlan ? "lg:col-span-4" : "lg:col-span-6")}>
          {isPlan ? (
            <div className="grid gap-4 md:grid-cols-3">
              {ENTITLEMENT_STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.key}
                    className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4"
                  >
                    <Icon className="size-6 opacity-40" aria-hidden />
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-sm">{stat.label}</span>
                      <span className="text-lg font-semibold tabular-nums">
                        {service[stat.field]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <h3 className="mb-2 font-semibold">Description</h3>
                <p className="text-muted-foreground text-sm">
                  {service.description?.trim() || "—"}
                </p>
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
