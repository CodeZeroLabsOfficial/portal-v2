"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlignLeft,
  ArrowLeft,
  Calculator,
  CircleDot,
  CreditCard,
  DollarSign,
  Layers,
  Package,
  Tag,
  Users
} from "lucide-react";

import { CatalogServicePlanFeaturesSection } from "@/components/features/catalog/catalog-service-plan-features-section";
import { CatalogServiceStripeCard } from "@/components/features/catalog/catalog-service-stripe-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { InlineEditableField } from "@/components/shared/inline-editable-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyAmount } from "@/lib/common/format";
import {
  catalogServiceStatusBadgeDisplay
} from "@/lib/catalog/status-badges";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  archiveCatalogServiceAction,
  saveAndActivateCatalogServiceAction,
  saveAndSyncCatalogServiceStripeAction,
  saveCatalogServiceAction
} from "@/server/actions/catalog-services";
import type { CatalogServiceRecord } from "@/types/catalog-service";
import { cn } from "@/lib/utils";

function termMinor(service: CatalogServiceRecord, months: 12 | 24): number {
  return service.terms.find((t) => t.months === months)?.monthlyAmountMinor ?? 0;
}

function serviceTypeLabel(service: CatalogServiceRecord): string {
  if (service.serviceType === "plan") return "Plan";
  if (service.serviceType === "addon") return "Add-on";
  return "—";
}

function billingLabel(service: CatalogServiceRecord): string {
  if (service.billingType === "one_off") return "One-off";
  if (service.billingType === "recurring") return "Recurring";
  return "—";
}

function pricingModelLabel(service: CatalogServiceRecord): string {
  if (service.pricingModel === "flat") return "Flat rate";
  if (service.pricingModel === "by_term") return "Fixed term (12 / 24 mo)";
  return "—";
}

function pricingDetailLabel(service: CatalogServiceRecord): React.ReactNode {
  const terms = service.terms;
  if (terms.length === 0) return "—";

  const currency = service.currency;
  const isByTerm = service.pricingModel === "by_term";
  const term12 = terms.find((t) => t.months === 12);
  const term24 = terms.find((t) => t.months === 24);

  if (isByTerm && (term12 || term24)) {
    const lines: string[] = [];
    if (term12 && term12.monthlyAmountMinor > 0) {
      lines.push(`12 mo · ${formatCurrencyAmount(term12.monthlyAmountMinor, currency)}/mo`);
    }
    if (term24 && term24.monthlyAmountMinor > 0) {
      lines.push(`24 mo · ${formatCurrencyAmount(term24.monthlyAmountMinor, currency)}/mo`);
    }
    if (lines.length === 0) return "—";
    if (lines.length === 1) return lines[0];
    return (
      <span className="flex flex-col gap-0.5">
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </span>
    );
  }

  const amount = terms[0]?.monthlyAmountMinor ?? 0;
  if (amount <= 0) return "—";
  const formatted = formatCurrencyAmount(amount, currency);
  if (service.billingType === "one_off") return formatted;
  return `${formatted}/mo`;
}

const detailLabelClass =
  "flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground";

type ServiceFieldOverrides = {
  name?: string;
  description?: string;
  includedUsers?: number;
  includedLocations?: number;
  includedAdmins?: number;
  features?: string[];
};

export interface CatalogServiceEditFormProps {
  service: CatalogServiceRecord;
}

export function CatalogServiceEditForm({ service }: CatalogServiceEditFormProps) {
  const router = useRouter();
  const [message, setMessage] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [activeFieldId, setActiveFieldId] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const st = catalogServiceStatusBadgeDisplay(service.status);
  const fieldsDisabled = service.status === "archived";
  const readOnly = fieldsDisabled || busy;
  const isPlan = service.serviceType !== "addon";

  function buildSavePayload(overrides: ServiceFieldOverrides = {}) {
    return {
      serviceId: service.id,
      name: (overrides.name ?? service.name).trim(),
      description:
        overrides.description !== undefined
          ? overrides.description.trim() || undefined
          : service.description?.trim() || undefined,
      currency: service.currency,
      includedUsers: overrides.includedUsers ?? service.includedUsers,
      includedLocations: overrides.includedLocations ?? service.includedLocations,
      includedAdmins: overrides.includedAdmins ?? service.includedAdmins,
      monthlyCost12Minor: termMinor(service, 12),
      monthlyCost24Minor: termMinor(service, 24),
      ...(typeof service.upfrontCost12Minor === "number"
        ? { upfrontCost12Minor: service.upfrontCost12Minor }
        : {}),
      features: overrides.features ?? service.features
    };
  }

  async function persistField(
    overrides: ServiceFieldOverrides
  ): Promise<{ ok: boolean; message?: string }> {
    const res = await saveCatalogServiceAction(buildSavePayload(overrides));
    if (res.ok) router.refresh();
    return res;
  }

  function parseNonNegativeInt(
    raw: string,
    label: string
  ): { ok: true; value: number } | { ok: false; message: string } {
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 0) {
      return { ok: false, message: `Enter a valid ${label}.` };
    }
    return { ok: true, value: n };
  }

  async function runAction(
    fn: () => Promise<{ ok: boolean; message?: string }>,
    opts?: { redirectToList?: boolean }
  ) {
    setBusy(true);
    setMessage(null);
    setActiveFieldId(null);
    const res = await fn();
    setBusy(false);
    if (!res.ok) {
      setMessage(res.message ?? "Something went wrong.");
      return;
    }
    if (opts?.redirectToList) {
      router.push("/admin/services");
      router.refresh();
      return;
    }
    router.refresh();
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" asChild>
            <Link href="/admin/services">
              <ArrowLeft className="size-4" />
              Services
            </Link>
          </Button>
          {service.status !== "archived" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={busy}
              onClick={() => setConfirmOpen(true)}>
              Archive
            </Button>
          ) : null}
        </div>

        {message ? <p className="text-destructive text-sm">{message}</p> : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="text-muted-foreground size-5" />
                Service details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className={detailLabelClass}>
                    <Tag className="size-3.5" />
                    Name
                  </dt>
                  <dd>
                    <InlineEditableField
                      fieldId="name"
                      activeFieldId={activeFieldId}
                      onActiveFieldIdChange={setActiveFieldId}
                      value={service.name}
                      editLabel="name"
                      disabled={fieldsDisabled}
                      onSave={async (next) => {
                        const trimmed = next.trim();
                        if (!trimmed) return { ok: false, message: "Name is required." };
                        return persistField({ name: trimmed });
                      }}
                    />
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className={detailLabelClass}>
                    <CircleDot className="size-3.5" />
                    Status
                  </dt>
                  <dd>
                    <StatusBadge label={st.label} variant={st.variant} />
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className={detailLabelClass}>
                    <Layers className="size-3.5" />
                    Type
                  </dt>
                  <dd>{service.serviceType ? serviceTypeLabel(service) : "—"}</dd>
                </div>
                <div className="space-y-1">
                  <dt className={detailLabelClass}>
                    <Calculator className="size-3.5" />
                    Pricing model
                  </dt>
                  <dd>{pricingModelLabel(service)}</dd>
                </div>
                <div className="space-y-1">
                  <dt className={detailLabelClass}>
                    <CreditCard className="size-3.5" />
                    Billing
                  </dt>
                  <dd>{billingLabel(service)}</dd>
                </div>
                <div className="space-y-1">
                  <dt className={detailLabelClass}>
                    <DollarSign className="size-3.5" />
                    Pricing
                  </dt>
                  <dd>{pricingDetailLabel(service)}</dd>
                </div>
              </dl>

              <div className="space-y-1 border-t pt-4">
                <p className={detailLabelClass}>
                  <AlignLeft className="size-3.5" />
                  Description
                </p>
                <InlineEditableField
                  fieldId="description"
                  activeFieldId={activeFieldId}
                  onActiveFieldIdChange={setActiveFieldId}
                  value={service.description ?? ""}
                  editLabel="description"
                  multiline
                  disabled={fieldsDisabled}
                  onSave={async (next) => persistField({ description: next.trim() })}
                />
              </div>

              {isPlan ? (
                <div className="space-y-4 border-t pt-4">
                  <p className={detailLabelClass}>
                    <Users className="size-3.5" />
                    Entitlements
                  </p>
                  <dl className="flex flex-wrap gap-x-8 gap-y-4">
                    {(
                      [
                        ["includedUsers", "Included users", service.includedUsers],
                        ["includedLocations", "Included locations", service.includedLocations],
                        ["includedAdmins", "Included admins", service.includedAdmins]
                      ] as const
                    ).map(([key, label, val]) => (
                      <div key={key} className="space-y-1">
                        <dt className="text-muted-foreground text-[13px]">{label}</dt>
                        <dd>
                          <InlineEditableField
                            fieldId={key}
                            activeFieldId={activeFieldId}
                            onActiveFieldIdChange={setActiveFieldId}
                            value={String(val)}
                            editLabel={label}
                            inputType="number"
                            inputMin={0}
                            disabled={fieldsDisabled}
                            onSave={async (next) => {
                              const parsed = parseNonNegativeInt(next, label.toLowerCase());
                              if (!parsed.ok) return parsed;
                              return persistField({ [key]: parsed.value });
                            }}
                          />
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <CatalogServicePlanFeaturesSection
                    features={service.features}
                    disabled={fieldsDisabled}
                    activeFieldId={activeFieldId}
                    onActiveFieldIdChange={setActiveFieldId}
                    onSaveFeatures={async (features) => persistField({ features })}
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <CatalogServiceStripeCard
            service={service}
            busy={busy}
            readOnly={readOnly}
            onActivateSync={
              service.status === "draft"
                ? () => void runAction(() => saveAndActivateCatalogServiceAction(buildSavePayload()))
                : undefined
            }
            onResync={
              service.status === "active"
                ? () => void runAction(() => saveAndSyncCatalogServiceStripeAction(buildSavePayload()))
                : undefined
            }
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Archive service"
        description="Archive this service? It will be hidden from new proposals and subscriptions."
        confirmLabel="Archive"
        destructive
        onConfirm={async () => {
          await runAction(() => archiveCatalogServiceAction(service.id), { redirectToList: true });
        }}
      />
    </>
  );
}
