"use client";

import * as React from "react";
import type { CatalogServicePickerOption } from "@/types/catalog-service";

/** Active catalogue services for proposal plan tiers (same list as Add subscription). */
export const EditorCatalogServicesContext = React.createContext<readonly CatalogServicePickerOption[]>([]);

export function useEditorCatalogServices(): readonly CatalogServicePickerOption[] {
  return React.useContext(EditorCatalogServicesContext);
}

/** When true (proposal templates), tier/add-on unit prices are read-only — edit in Admin → Services. */
export const EditorTemplatePricingReadOnlyContext = React.createContext(false);

export function useEditorTemplatePricingReadOnly(): boolean {
  return React.useContext(EditorTemplatePricingReadOnlyContext);
}
