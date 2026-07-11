import { formatCurrencyAmount } from "@/lib/common/format";
import type { CatalogServiceRecord, CatalogServiceTermMonths } from "@/types/catalog-service";

export function catalogServiceTypeLabel(service: CatalogServiceRecord): string {
  if (service.serviceType === "plan") return "Plan";
  if (service.serviceType === "addon") return "Add-on";
  return "—";
}

export function catalogBillingLabel(service: CatalogServiceRecord): string {
  if (service.billingType === "one_off") return "One-off";
  if (service.billingType === "recurring") return "Recurring";
  return "—";
}

export function catalogPricingModelLabel(service: CatalogServiceRecord): string {
  if (service.pricingModel === "flat") return "Flat rate";
  if (service.pricingModel === "by_term") return "Fixed term (12 / 24 mo)";
  return "—";
}

export function catalogTermAmountMinor(
  service: CatalogServiceRecord,
  months: CatalogServiceTermMonths
): number {
  return service.terms.find((t) => t.months === months)?.monthlyAmountMinor ?? 0;
}

export function catalogAvailableTermMonths(
  service: CatalogServiceRecord
): CatalogServiceTermMonths[] {
  if (service.pricingModel !== "by_term") return [];
  return ([12, 24] as const).filter((months) => catalogTermAmountMinor(service, months) > 0);
}

function formatCatalogPriceAmount(service: CatalogServiceRecord, amountMinor: number): string | null {
  if (amountMinor <= 0) return null;
  const formatted = formatCurrencyAmount(amountMinor, service.currency);
  if (service.billingType === "one_off") return formatted;
  return `${formatted}/mo`;
}

export function catalogHeroPriceLabel(
  service: CatalogServiceRecord,
  selectedTermMonths?: CatalogServiceTermMonths
): string {
  const terms = service.terms;
  if (terms.length === 0) return "—";

  if (service.pricingModel === "by_term" && selectedTermMonths) {
    const byTerm = formatCatalogPriceAmount(
      service,
      catalogTermAmountMinor(service, selectedTermMonths)
    );
    if (byTerm) return byTerm;
  }

  const flat = formatCatalogPriceAmount(service, terms[0]?.monthlyAmountMinor ?? 0);
  return flat ?? "—";
}

/** Formatted one-time upfront for by-term plans; null when not applicable. */
export function catalogUpfrontCostLabel(
  service: CatalogServiceRecord,
  termMonths?: CatalogServiceTermMonths,
): string | null {
  const amount =
    termMonths === 24 ? service.upfrontCost24Minor : service.upfrontCost12Minor;
  if (typeof amount !== "number" || amount <= 0) return null;
  return formatCurrencyAmount(amount, service.currency);
}

export function catalogPricingLabel(service: CatalogServiceRecord): string {
  const terms = service.terms;
  if (terms.length === 0) return "—";

  const amounts = terms.map((t) => t.monthlyAmountMinor);
  const distinct = new Set(amounts);

  if (terms.length === 1 || distinct.size === 1) {
    const amount = amounts[0] ?? 0;
    return amount > 0 ? formatCurrencyAmount(amount, service.currency) : "—";
  }

  return "Multiple";
}

export function formatCatalogTableDate(ms: number | undefined): string {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return "—";
  try {
    return new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(new Date(ms));
  } catch {
    return "—";
  }
}
