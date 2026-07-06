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

export function catalogPricingDetailLines(service: CatalogServiceRecord): string | string[] {
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
    return lines.length === 1 ? lines[0]! : lines;
  }

  const amount = terms[0]?.monthlyAmountMinor ?? 0;
  if (amount <= 0) return "—";
  const formatted = formatCurrencyAmount(amount, currency);
  if (service.billingType === "one_off") return formatted;
  return `${formatted}/mo`;
}

export function catalogHeroPriceLabel(
  service: CatalogServiceRecord,
  selectedTermMonths?: CatalogServiceTermMonths
): string {
  const terms = service.terms;
  if (terms.length === 0) return "—";

  const currency = service.currency;

  if (service.pricingModel === "by_term" && selectedTermMonths) {
    const amount = catalogTermAmountMinor(service, selectedTermMonths);
    if (amount > 0) {
      return `${formatCurrencyAmount(amount, currency)}/mo`;
    }
  }

  const amount = terms[0]?.monthlyAmountMinor ?? 0;
  if (amount <= 0) return "—";
  const formatted = formatCurrencyAmount(amount, currency);
  if (service.billingType === "one_off") return formatted;
  return `${formatted}/mo`;
}

export function formatCatalogStripeSyncedAt(ms: number | undefined): string {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(ms));
  } catch {
    return "—";
  }
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
