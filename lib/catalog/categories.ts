import type { CatalogCategoryOption } from "@/types/catalog-category";

/**
 * Seeded on first list for an org so existing services/proposals keep resolving.
 * Not the runtime source of truth — categories live in Firestore after seed.
 */
export const SEED_CATALOG_CATEGORIES: readonly CatalogCategoryOption[] = [
  { id: "chauffeur", label: "Chauffeur" },
  { id: "professional_services", label: "Professional services" },
] as const;

export const DEFAULT_CATALOG_CATEGORY_ID = SEED_CATALOG_CATEGORIES[0].id;

/** Stable slug for category ids and Stripe lookup-key prefixes. */
export function slugifyCatalogCategoryLabel(label: string): string {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return base.length > 0 ? base : "category";
}

/** Valid category id / lookup-key segment. */
export function isCatalogCategoryId(value: string): boolean {
  return /^[a-z][a-z0-9_]{0,39}$/.test(value.trim());
}

export function catalogCategoryLabel(
  id: string,
  options?: readonly CatalogCategoryOption[],
): string {
  const trimmed = id.trim();
  if (!trimmed) return id;
  const fromOptions = options?.find((o) => o.id === trimmed)?.label;
  if (fromOptions) return fromOptions;
  const fromSeed = SEED_CATALOG_CATEGORIES.find((o) => o.id === trimmed)?.label;
  return fromSeed ?? trimmed;
}

/** Prefer a stored slug when valid; otherwise first option or seed default. */
export function resolveCatalogCategoryId(
  raw: string | undefined | null,
  options?: readonly CatalogCategoryOption[],
): string {
  const trimmed = raw?.trim() ?? "";
  if (trimmed && isCatalogCategoryId(trimmed)) return trimmed;
  if (options && options.length > 0) return options[0].id;
  return DEFAULT_CATALOG_CATEGORY_ID;
}
