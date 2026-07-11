/** Controlled product-line categories for catalogue services and proposals. */
export const CATALOG_CATEGORIES = [
  { id: "chauffeur", label: "Chauffeur" },
  { id: "professional_services", label: "Professional services" },
] as const;

export type CatalogCategoryId = (typeof CATALOG_CATEGORIES)[number]["id"];

export const DEFAULT_CATALOG_CATEGORY_ID: CatalogCategoryId = CATALOG_CATEGORIES[0].id;

const CATEGORY_IDS = new Set<string>(CATALOG_CATEGORIES.map((c) => c.id));

export function isCatalogCategoryId(value: string): value is CatalogCategoryId {
  return CATEGORY_IDS.has(value);
}

export function catalogCategoryLabel(id: string): string {
  return CATALOG_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/** Resolve a stored/raw category; unknown or empty → default (migration). */
export function resolveCatalogCategoryId(raw: string | undefined | null): CatalogCategoryId {
  const trimmed = raw?.trim() ?? "";
  if (trimmed && isCatalogCategoryId(trimmed)) return trimmed;
  return DEFAULT_CATALOG_CATEGORY_ID;
}
