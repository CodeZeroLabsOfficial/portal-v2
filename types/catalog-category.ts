/** Org-scoped product-line category (`catalog_categories/{id}`). */
export interface CatalogCategoryRecord {
  id: string;
  organizationId: string;
  /** Display name (e.g. "Professional services"). */
  label: string;
  createdAt: number;
  updatedAt: number;
}

/** Lightweight option for selects / comboboxes. */
export interface CatalogCategoryOption {
  id: string;
  label: string;
}
