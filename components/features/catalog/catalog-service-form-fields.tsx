"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { FieldErrors, UseFormReturn } from "react-hook-form";

import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { catalogServiceKindBadgeDisplay } from "@/lib/catalog/status-badges";
import {
  normalizeLookupKeyBase,
  previewCatalogServiceLookupKeys,
  slugifyCatalogServiceName,
} from "@/lib/catalog/service-slug";
import type { CreateCatalogServiceInput } from "@/lib/schemas/catalog-service";
import { cn } from "@/lib/utils";
import type { CatalogServiceKind } from "@/types/catalog-service";

export const CATALOG_SERVICE_SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function lookupKeyBaseFromName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return slugifyCatalogServiceName(trimmed);
}

function PricingRow({
  id,
  label,
  value,
  onChange,
  disabled,
  required,
  error,
  placeholder = "0.00",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  placeholder?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-t px-3 py-2.5">
      <Label htmlFor={id} className="font-normal">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <div className="flex flex-col items-end gap-1">
        <Input
          id={id}
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          className="h-9 w-[8.5rem] shrink-0 text-right"
          onChange={(event) => onChange(event.target.value)}
        />
        {error ? <p className="text-xs leading-tight text-destructive">{error}</p> : null}
      </div>
    </li>
  );
}

function EntitlementRow({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-t px-3 py-2.5">
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        min={0}
        max={1_000_000}
        step={1}
        value={value}
        disabled={disabled}
        aria-label={label}
        className="h-9 w-[8.5rem] shrink-0 text-right"
        onChange={(event) => {
          const n = Number.parseInt(event.target.value, 10);
          onChange(Number.isFinite(n) && n >= 0 ? Math.min(n, 1_000_000) : 0);
        }}
      />
    </li>
  );
}

export interface CatalogServiceFormFieldsProps {
  form: UseFormReturn<CreateCatalogServiceInput>;
  mode: "create" | "edit";
  serviceType: CatalogServiceKind;
  busy: boolean;
  lookupKeyBase: string;
  setLookupKeyBase: React.Dispatch<React.SetStateAction<string>>;
  lookupTouched: boolean;
  setLookupTouched: React.Dispatch<React.SetStateAction<boolean>>;
  flatPrice: string;
  setFlatPrice: React.Dispatch<React.SetStateAction<string>>;
  upfrontPrice: string;
  setUpfrontPrice: React.Dispatch<React.SetStateAction<string>>;
  monthly12: string;
  setMonthly12: React.Dispatch<React.SetStateAction<string>>;
  monthly24: string;
  setMonthly24: React.Dispatch<React.SetStateAction<string>>;
  idPrefix?: string;
}

export function CatalogServiceFormFields({
  form,
  mode,
  serviceType,
  busy,
  lookupKeyBase,
  setLookupKeyBase,
  lookupTouched,
  setLookupTouched,
  flatPrice,
  setFlatPrice,
  upfrontPrice,
  setUpfrontPrice,
  monthly12,
  setMonthly12,
  monthly24,
  setMonthly24,
  idPrefix = "catalog",
}: CatalogServiceFormFieldsProps) {
  const name = form.watch("name");
  const billingType = form.watch("billingType");
  const pricingModel = form.watch("pricingModel");
  const includedUsers = form.watch("includedUsers") ?? 0;
  const includedLocations = form.watch("includedLocations") ?? 0;
  const includedAdmins = form.watch("includedAdmins") ?? 0;
  const { errors } = form.formState;

  const isPlan = serviceType === "plan";
  const isOneOff = billingType === "one_off";
  const isFlat = isOneOff || pricingModel === "flat";
  const isByTerm = !isOneOff && pricingModel === "by_term";
  const showUpfront = isPlan && isByTerm;

  const resolvedLookupBase =
    normalizeLookupKeyBase(lookupKeyBase) || lookupKeyBaseFromName(name);

  const lookupPreview = React.useMemo(() => {
    const ctx = {
      lookupKeyBase: resolvedLookupBase,
      serviceType,
      billingType,
      pricingModel: isOneOff ? ("flat" as const) : pricingModel,
    };
    return previewCatalogServiceLookupKeys(ctx);
  }, [resolvedLookupBase, serviceType, billingType, pricingModel, isOneOff]);

  React.useEffect(() => {
    if (mode === "edit" || lookupTouched) return;
    setLookupKeyBase(lookupKeyBaseFromName(name));
  }, [mode, name, lookupTouched, setLookupKeyBase]);

  React.useEffect(() => {
    if (isOneOff && pricingModel !== "flat") {
      form.setValue("pricingModel", "flat", { shouldDirty: true });
    }
  }, [isOneOff, pricingModel, form]);

  const typeBadge = catalogServiceKindBadgeDisplay(serviceType);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-service-name`}>
          Service or product name <span className="text-destructive">*</span>
        </Label>
        {mode === "create" ? (
          <div className="flex overflow-hidden rounded-md border border-input focus-within:ring-2 focus-within:ring-ring">
            <div className="relative shrink-0 border-r border-input">
              <select
                id={`${idPrefix}-service-type`}
                className="h-9 appearance-none bg-transparent py-1 pl-3 pr-7 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                disabled={busy}
                value={serviceType}
                aria-label="Service type"
                onChange={(event) =>
                  form.setValue("serviceType", event.target.value as CatalogServiceKind, {
                    shouldDirty: true,
                  })
                }
              >
                <option value="plan">Plan</option>
                <option value="addon">Add-on</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </div>
            <Input
              id={`${idPrefix}-service-name`}
              autoComplete="off"
              className="h-9 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0"
              placeholder="Service or product name"
              disabled={busy}
              {...form.register("name")}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <StatusBadge label={typeBadge.label} variant={typeBadge.variant} />
            <Input
              id={`${idPrefix}-service-name`}
              autoComplete="off"
              disabled={busy}
              placeholder="Service or product name"
              {...form.register("name")}
            />
          </div>
        )}
        {typeof errors.name?.message === "string" ? (
          <p className="text-xs leading-tight text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-billing-type`}>Billing</Label>
          <select
            id={`${idPrefix}-billing-type`}
            className={CATALOG_SERVICE_SELECT_CLASS}
            disabled={busy}
            value={billingType}
            onChange={(event) =>
              form.setValue("billingType", event.target.value as "recurring" | "one_off", {
                shouldDirty: true,
              })
            }
          >
            <option value="recurring">Recurring</option>
            <option value="one_off">One-off</option>
          </select>
        </div>

        <div className={cn("flex flex-col gap-1.5", isOneOff && "opacity-50")}>
          <Label htmlFor={`${idPrefix}-pricing-model`}>Pricing model</Label>
          <select
            id={`${idPrefix}-pricing-model`}
            className={CATALOG_SERVICE_SELECT_CLASS}
            disabled={busy || isOneOff}
            value={isOneOff ? "flat" : pricingModel}
            onChange={(event) =>
              form.setValue("pricingModel", event.target.value as "flat" | "by_term", {
                shouldDirty: true,
              })
            }
          >
            <option value="flat">Flat rate (one price)</option>
            <option value="by_term">Fixed term</option>
          </select>
          {isOneOff ? (
            <p className="text-xs text-muted-foreground">One-off charges use a single flat price.</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-service-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-service-description`}
          rows={2}
          disabled={busy}
          className="min-h-[3.25rem] resize-none"
          placeholder="Provide a brief description of the product or service"
          {...form.register("description")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-lookup-key`}>
          Lookup key <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${idPrefix}-lookup-key`}
          autoComplete="off"
          className="font-mono"
          placeholder="Enter unique lookup key (e.g. premium_monthly)"
          value={lookupKeyBase}
          disabled={busy}
          onChange={(event) => {
            setLookupTouched(true);
            setLookupKeyBase(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
          }}
        />
        {typeof errors.lookupKeyBase?.message === "string" ? (
          <p className="text-xs leading-tight text-destructive">{errors.lookupKeyBase.message}</p>
        ) : null}
        {resolvedLookupBase ? (
          <p className="text-xs leading-snug text-muted-foreground">
            Stripe lookup key{lookupPreview.length > 1 ? "s" : ""}:{" "}
            <span className="font-mono">{lookupPreview.join(" · ")}</span>
          </p>
        ) : null}
      </div>

      <div className={cn("grid gap-4", isPlan ? "md:grid-cols-2" : "md:grid-cols-1")}>
        <div className="overflow-hidden rounded-lg border">
          <p className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">Pricing</p>
          <ul>
            {isFlat ? (
              <PricingRow
                id={`${idPrefix}-flat-price`}
                label={isOneOff ? "One-off price (AUD)" : "Monthly price (AUD)"}
                value={flatPrice}
                disabled={busy}
                required
                error={
                  typeof errors.flatAmountMinor?.message === "string"
                    ? errors.flatAmountMinor.message
                    : undefined
                }
                onChange={setFlatPrice}
              />
            ) : (
              <>
                {showUpfront ? (
                  <PricingRow
                    id={`${idPrefix}-upfront-price`}
                    label="Upfront price (AUD)"
                    value={upfrontPrice}
                    disabled={busy}
                    placeholder="0.00"
                    onChange={setUpfrontPrice}
                  />
                ) : null}
                <PricingRow
                  id={`${idPrefix}-m12`}
                  label="12-month price (AUD)"
                  value={monthly12}
                  disabled={busy}
                  required
                  error={
                    typeof errors.monthlyCost12Minor?.message === "string"
                      ? errors.monthlyCost12Minor.message
                      : undefined
                  }
                  onChange={setMonthly12}
                />
                <PricingRow
                  id={`${idPrefix}-m24`}
                  label="24-month price (AUD)"
                  value={monthly24}
                  disabled={busy}
                  required
                  error={
                    typeof errors.monthlyCost24Minor?.message === "string"
                      ? errors.monthlyCost24Minor.message
                      : undefined
                  }
                  onChange={setMonthly24}
                />
              </>
            )}
          </ul>
        </div>

        {isPlan ? (
          <div className="overflow-hidden rounded-lg border">
            <p className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
              Entitlements
            </p>
            <ul>
              <EntitlementRow
                id={`${idPrefix}-included-users`}
                label="Included users"
                value={includedUsers}
                disabled={busy}
                onChange={(next) =>
                  form.setValue("includedUsers", next, { shouldDirty: true, shouldValidate: true })
                }
              />
              <EntitlementRow
                id={`${idPrefix}-included-locations`}
                label="Included locations"
                value={includedLocations}
                disabled={busy}
                onChange={(next) =>
                  form.setValue("includedLocations", next, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <EntitlementRow
                id={`${idPrefix}-included-admins`}
                label="Included admins"
                value={includedAdmins}
                disabled={busy}
                onChange={(next) =>
                  form.setValue("includedAdmins", next, { shouldDirty: true, shouldValidate: true })
                }
              />
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function catalogServiceFormInvalidMessage(
  errors: FieldErrors<CreateCatalogServiceInput>,
): string {
  const messages = [
    errors.name?.message,
    errors.lookupKeyBase?.message,
    errors.flatAmountMinor?.message,
    errors.monthlyCost12Minor?.message,
    errors.monthlyCost24Minor?.message,
    errors.pricingModel?.message,
  ].filter((message): message is string => typeof message === "string" && message.length > 0);
  return messages[0] ?? "Please check the form and try again.";
}

export function useCatalogServicePricingFlags(
  serviceType: CatalogServiceKind,
  billingType: CreateCatalogServiceInput["billingType"],
  pricingModel: CreateCatalogServiceInput["pricingModel"],
) {
  const isPlan = serviceType === "plan";
  const isOneOff = billingType === "one_off";
  const isFlat = isOneOff || pricingModel === "flat";
  const isByTerm = !isOneOff && pricingModel === "by_term";
  const showUpfront = isPlan && isByTerm;
  return { isPlan, isOneOff, isFlat, isByTerm, showUpfront };
}
