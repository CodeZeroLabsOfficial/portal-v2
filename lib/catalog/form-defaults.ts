import { normalizeLookupKeyBase } from "@/lib/catalog/service-slug";
import type { CreateCatalogServiceInput, UpdateCatalogServiceInput } from "@/lib/schemas/catalog-service";
import type { CatalogServiceRecord } from "@/types/catalog-service";

export function majorInputToMinor(raw: string): number {
  const n = Number.parseFloat(raw.replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

export function minorToMajorInput(minor: number | undefined): string {
  if (typeof minor !== "number" || minor <= 0) return "";
  return (minor / 100).toFixed(2);
}

export function serviceToEditDefaults(service: CatalogServiceRecord): UpdateCatalogServiceInput {
  const term12 = service.terms.find((term) => term.months === 12);
  const term24 = service.terms.find((term) => term.months === 24);
  const flatTerm = service.terms.find((term) => !term.months) ?? service.terms[0];
  const pricingModel = service.pricingModel ?? (service.terms.length >= 2 ? "by_term" : "flat");
  const isFlat = service.billingType === "one_off" || pricingModel === "flat";

  return {
    serviceId: service.id,
    name: service.name,
    description: service.description ?? "",
    lookupKeyBase: service.slug,
    billingType: service.billingType ?? "recurring",
    pricingModel,
    currency: service.currency,
    flatAmountMinor: isFlat ? flatTerm?.monthlyAmountMinor : undefined,
    monthlyCost12Minor: !isFlat ? term12?.monthlyAmountMinor : undefined,
    monthlyCost24Minor: !isFlat ? term24?.monthlyAmountMinor : undefined,
    includedUsers: service.includedUsers,
    includedLocations: service.includedLocations,
    includedAdmins: service.includedAdmins,
    upfrontCost12Minor: service.upfrontCost12Minor,
  };
}

export function servicePriceControlDefaults(service: CatalogServiceRecord): {
  flatPrice: string;
  upfrontPrice: string;
  monthly12: string;
  monthly24: string;
} {
  const defaults = serviceToEditDefaults(service);
  const isOneOff = defaults.billingType === "one_off";
  const isFlat = isOneOff || defaults.pricingModel === "flat";

  return {
    flatPrice: isFlat ? minorToMajorInput(defaults.flatAmountMinor) : "",
    upfrontPrice: minorToMajorInput(defaults.upfrontCost12Minor),
    monthly12: !isFlat ? minorToMajorInput(defaults.monthlyCost12Minor) : "",
    monthly24: !isFlat ? minorToMajorInput(defaults.monthlyCost24Minor) : "",
  };
}

interface BuildCatalogPayloadOptions {
  values: CreateCatalogServiceInput | UpdateCatalogServiceInput;
  resolvedLookupBase: string;
  isPlan: boolean;
  isFlat: boolean;
  isByTerm: boolean;
  showUpfront: boolean;
  flatPrice: string;
  upfrontPrice: string;
  monthly12: string;
  monthly24: string;
}

/** Normalizes form + price controls into a create/update payload. */
export function buildCatalogServicePayload(
  options: BuildCatalogPayloadOptions,
): CreateCatalogServiceInput | UpdateCatalogServiceInput {
  const {
    values,
    resolvedLookupBase,
    isPlan,
    isFlat,
    isByTerm,
    showUpfront,
    flatPrice,
    upfrontPrice,
    monthly12,
    monthly24,
  } = options;

  const effectivePricing = values.billingType === "one_off" ? "flat" : values.pricingModel;
  const upfrontMinor = showUpfront ? majorInputToMinor(upfrontPrice) : 0;

  return {
    ...values,
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
    lookupKeyBase: normalizeLookupKeyBase(resolvedLookupBase) || resolvedLookupBase,
    pricingModel: effectivePricing,
    flatAmountMinor: isFlat ? majorInputToMinor(flatPrice) : undefined,
    monthlyCost12Minor: isByTerm ? majorInputToMinor(monthly12) : undefined,
    monthlyCost24Minor: isByTerm ? majorInputToMinor(monthly24) : undefined,
    upfrontCost12Minor: showUpfront && upfrontMinor > 0 ? upfrontMinor : undefined,
    includedUsers: isPlan ? Math.max(0, Math.floor(Number(values.includedUsers) || 0)) : 0,
    includedLocations: isPlan ? Math.max(0, Math.floor(Number(values.includedLocations) || 0)) : 0,
    includedAdmins: isPlan ? Math.max(0, Math.floor(Number(values.includedAdmins) || 0)) : 0,
  };
}
