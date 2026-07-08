"use client";

import * as React from "react";

import { ProposalSectionEditorChromeContext } from "@/components/features/proposal/editor/section-chrome/proposal-section-editor-chrome";
import {
  resolveSectionBackground,
  sectionPrefersLightForeground,
} from "@/lib/proposal/section-background";
import { mergeSplashBackground, resolveSplashBackdrop } from "@/lib/proposal/splash-block";
import type { ProposalToolbarAppearance } from "@/lib/proposal/editor-toolbar-tokens";
import type { AgreementBlock, PackagesBlock, ProposalBlock, SectionBlock, SplashBlock } from "@/types/proposal";

function bandToolbarAppearance(block: ProposalBlock): ProposalToolbarAppearance {
  if (block.type === "splash") {
    const resolved = resolveSplashBackdrop(mergeSplashBackground((block as SplashBlock).background));
    return resolved.prefersLightForeground ? "elevated" : "surface";
  }
  if (block.type === "section" || block.type === "packages" || block.type === "agreement") {
    const resolved = resolveSectionBackground(
      (block as SectionBlock | PackagesBlock | AgreementBlock).background,
    );
    return resolved.active && sectionPrefersLightForeground(resolved) ? "elevated" : "surface";
  }
  return "surface";
}

export interface SectionBandShellProps {
  block: ProposalBlock;
  /** Inside-band chrome (a `BlockToolbarHost` at the band's top-end corner). */
  toolbar: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Row wrapper for flush backdrop bands: hosts the inside-band toolbar above the band
 * content, resolving the toolbar appearance (elevated on dark backdrops) — the band
 * itself is rendered by the block editor via `ProposalSectionShell`.
 */
export function SectionBandShell({ block, toolbar, children }: SectionBandShellProps) {
  const appearance = React.useMemo(() => bandToolbarAppearance(block), [block]);
  return (
    <div className="relative min-w-0">
      <ProposalSectionEditorChromeContext.Provider value={{ seamless: true, appearance }}>
        {toolbar}
      </ProposalSectionEditorChromeContext.Provider>
      {children}
    </div>
  );
}
