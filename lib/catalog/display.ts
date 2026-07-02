import { formatCurrencyAmount } from "@/lib/common/format";
import type { CatalogServiceRecord } from "@/types/catalog-service";

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
