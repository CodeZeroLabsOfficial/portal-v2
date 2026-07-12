"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { FieldErrors, UseFormReturn } from "react-hook-form";

import { DecimalStepper } from "@/components/ui/decimal-stepper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumericStepper } from "@/components/ui/numeric-stepper";
import { Textarea } from "@/components/ui/textarea";
import { CatalogCategoryCombobox } from "@/components/shared/catalog-category-combobox";
import { useCatalogCategories } from "@/hooks/use-catalog-categories";
import type { CreateCatalogServiceInput } from "@/lib/schemas/catalog-service";
import { cn } from "@/lib/utils";
import type { CatalogServiceKind } from "@/types/catalog-service";

export const CATALOG_SERVICE_SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export type CatalogServiceFormSection = "all" | "overview" | "pricing";

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
    <li className="flex items-center justify-between gap-3 border-t px-3 py-2.5 first:border-t-0">
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

function PricingStepperRow({
  id,
  label,
  value,
  onChange,
  disabled,
  required,
  error,
  placeholder = "0.00",
  allowEmpty = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  placeholder?: string;
  allowEmpty?: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-t px-3 py-2.5 first:border-t-0">
      <Label htmlFor={id} className="font-normal">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <div className="flex flex-col items-end gap-1">
        <DecimalStepper
          id={id}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          allowEmpty={allowEmpty}
          aria-label={label}
          onChange={onChange}
        />
        {error ? <p className="text-xs leading-tight text-destructive">{error}</p> : null}
      </div>
    </li>
  );
}

function TermPricingColumn({
  title,
  idPrefix,
  showUpfront,
  upfront,
  setUpfront,
  monthly,
  setMonthly,
  monthlyError,
  disabled,
  className,
}: {
  title: string;
  idPrefix: string;
  showUpfront: boolean;
  upfront: string;
  setUpfront: (value: string) => void;
  monthly: string;
  setMonthly: (value: string) => void;
  monthlyError?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">{title}</p>
      <ul>
        {showUpfront ? (
          <PricingStepperRow
            id={`${idPrefix}-upfront`}
            label="Upfront"
            value={upfront}
            disabled={disabled}
            placeholder="0.00"
            allowEmpty
            onChange={setUpfront}
          />
        ) : null}
        <PricingStepperRow
          id={`${idPrefix}-monthly`}
          label="Monthly"
          value={monthly}
          disabled={disabled}
          required
          error={monthlyError}
          onChange={setMonthly}
        />
      </ul>
    </div>
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
    <li className="flex items-center justify-between gap-3 border-t px-3 py-2.5 first:border-t-0">
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
      <NumericStepper
        id={id}
        value={value}
        max={1_000_000}
        disabled={disabled}
        aria-label={label}
        onChange={onChange}
      />
    </li>
  );
}

function catalogFieldErrorMessage(error: { message?: unknown } | undefined): string | undefined {
  return typeof error?.message === "string" ? error.message : undefined;
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

export interface CatalogServiceFormFieldsProps {
  form: UseFormReturn<CreateCatalogServiceInput>;
  mode: "create" | "edit";
  serviceType: CatalogServiceKind;
  busy: boolean;
  flatPrice: string;
  setFlatPrice: React.Dispatch<React.SetStateAction<string>>;
  upfront12: string;
  setUpfront12: React.Dispatch<React.SetStateAction<string>>;
  upfront24: string;
  setUpfront24: React.Dispatch<React.SetStateAction<string>>;
  monthly12: string;
  setMonthly12: React.Dispatch<React.SetStateAction<string>>;
  monthly24: string;
  setMonthly24: React.Dispatch<React.SetStateAction<string>>;
  idPrefix?: string;
  section?: CatalogServiceFormSection;
}

export function CatalogServiceFormFields({
  form,
  mode,
  serviceType,
  busy,
  flatPrice,
  setFlatPrice,
  upfront12,
  setUpfront12,
  upfront24,
  setUpfront24,
  monthly12,
  setMonthly12,
  monthly24,
  setMonthly24,
  idPrefix = "catalog",
  section = "all",
}: CatalogServiceFormFieldsProps) {
  const { categories, createCategory } = useCatalogCategories();

  const category = form.watch("category");
  const billingType = form.watch("billingType");
  const pricingModel = form.watch("pricingModel");
  const includedUsers = form.watch("includedUsers") ?? 0;
  const includedLocations = form.watch("includedLocations") ?? 0;
  const includedAdmins = form.watch("includedAdmins") ?? 0;
  const { errors } = form.formState;

  const { isPlan, isOneOff, isFlat, showUpfront } = useCatalogServicePricingFlags(
    serviceType,
    billingType,
    pricingModel,
  );
  const showOverview = section === "all" || section === "overview";
  const showPricing = section === "all" || section === "pricing";

  React.useEffect(() => {
    if (isOneOff && pricingModel !== "flat") {
      form.setValue("pricingModel", "flat", { shouldDirty: true });
    }
  }, [isOneOff, pricingModel, form]);

  return (
    <div className="space-y-6">
      {showOverview ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-1.5">
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
                <Input
                  id={`${idPrefix}-service-name`}
                  autoComplete="off"
                  disabled={busy}
                  placeholder="Service or product name"
                  {...form.register("name")}
                />
              )}
              {typeof errors.name?.message === "string" ? (
                <p className="text-xs leading-tight text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-category`}>
                Category <span className="text-destructive">*</span>
              </Label>
              <CatalogCategoryCombobox
                id={`${idPrefix}-category`}
                disabled={busy}
                value={category}
                categories={categories}
                onValueChange={(next) =>
                  form.setValue("category", next, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                onCreateCategory={createCategory}
              />
              {typeof errors.category?.message === "string" ? (
                <p className="text-xs leading-tight text-destructive">{errors.category.message}</p>
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
        </>
      ) : null}

      {showPricing ? (
        <>
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

          <div className="overflow-hidden rounded-lg border">
            {isFlat ? (
              <>
                <p className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">Pricing</p>
                <ul>
                  <PricingRow
                    id={`${idPrefix}-flat-price`}
                    label={isOneOff ? "One-off price" : "Monthly price"}
                    value={flatPrice}
                    disabled={busy}
                    required
                    error={catalogFieldErrorMessage(errors.flatAmountMinor)}
                    onChange={setFlatPrice}
                  />
                </ul>
              </>
            ) : (
              <div className="grid md:grid-cols-2">
                <TermPricingColumn
                  title="12-month term"
                  idPrefix={`${idPrefix}-12`}
                  showUpfront={showUpfront}
                  upfront={upfront12}
                  setUpfront={setUpfront12}
                  monthly={monthly12}
                  setMonthly={setMonthly12}
                  monthlyError={catalogFieldErrorMessage(errors.monthlyCost12Minor)}
                  disabled={busy}
                  className="border-b md:border-b-0 md:border-r"
                />
                <TermPricingColumn
                  title="24-month term"
                  idPrefix={`${idPrefix}-24`}
                  showUpfront={showUpfront}
                  upfront={upfront24}
                  setUpfront={setUpfront24}
                  monthly={monthly24}
                  setMonthly={setMonthly24}
                  monthlyError={catalogFieldErrorMessage(errors.monthlyCost24Minor)}
                  disabled={busy}
                />
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function catalogServiceFormInvalidMessage(
  errors: FieldErrors<CreateCatalogServiceInput>,
): string {
  const messages = [
    errors.name?.message,
    errors.category?.message,
    errors.flatAmountMinor?.message,
    errors.monthlyCost12Minor?.message,
    errors.monthlyCost24Minor?.message,
    errors.pricingModel?.message,
  ].filter((message): message is string => typeof message === "string" && message.length > 0);
  return messages[0] ?? "Please check the form and try again.";
}

/** True when the first invalid field belongs on the Pricing section. */
export function catalogServiceFormInvalidIsPricing(
  errors: FieldErrors<CreateCatalogServiceInput>,
): boolean {
  return Boolean(
    errors.flatAmountMinor ||
      errors.monthlyCost12Minor ||
      errors.monthlyCost24Minor ||
      errors.pricingModel ||
      errors.billingType ||
      errors.upfrontCost12Minor ||
      errors.upfrontCost24Minor,
  );
}
