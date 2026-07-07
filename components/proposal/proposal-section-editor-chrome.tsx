"use client";

import * as React from "react";

import type { ProposalToolbarAppearance } from "@/lib/proposal/editor-toolbar-tokens";

/** Set by `ProposalSectionShell` in the editor so nested controls match the section fill. */
export const ProposalSectionEditorChromeContext = React.createContext<{
  seamless: boolean;
  /** `elevated` on dark bands (light foreground); `surface` on light bands. */
  appearance: ProposalToolbarAppearance;
} | null>(null);

export function useProposalSectionEditorChrome() {
  return React.useContext(ProposalSectionEditorChromeContext);
}

/** Section-band chrome when outside a seamless section shell (light canvas defaults). */
export function useProposalSectionEditorAppearance(): ProposalToolbarAppearance {
  return useProposalSectionEditorChrome()?.appearance ?? "surface";
}

/** Prefer an explicit toolbar appearance; otherwise match the enclosing section band. */
export function useResolvedProposalToolbarAppearance(
  appearanceProp?: ProposalToolbarAppearance,
): ProposalToolbarAppearance {
  const sectionAppearance = useProposalSectionEditorAppearance();
  return appearanceProp ?? sectionAppearance;
}
