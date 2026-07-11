"use client";

import * as React from "react";
import type { CatalogServicePickerOption } from "@/types/catalog-service";

/** Active catalogue services for proposal plan tiers (same list as Add subscription). */
export const EditorCatalogServicesContext = React.createContext<readonly CatalogServicePickerOption[]>([]);

export function useEditorCatalogServices(): readonly CatalogServicePickerOption[] {
  return React.useContext(EditorCatalogServicesContext);
}

/**
 * Proposal product-line category. When set, packages plan/addon pickers only show
 * matching catalogue services. Undefined (templates / legacy proposals) → no filter.
 */
export const EditorProposalCategoryContext = React.createContext<string | undefined>(undefined);

export function useEditorProposalCategory(): string | undefined {
  return React.useContext(EditorProposalCategoryContext);
}

/** When true, tier/add-on unit prices are read-only in the document editor — edit in Admin → Services. */
export const EditorTemplatePricingReadOnlyContext = React.createContext(true);

export function useEditorTemplatePricingReadOnly(): boolean {
  return React.useContext(EditorTemplatePricingReadOnlyContext);
}
