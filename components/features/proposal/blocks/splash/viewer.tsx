"use client";

import type { SplashBlock } from "@/types/proposal";
import { ProposalSplashBlockCanvas } from "@/components/features/proposal/blocks/splash/splash-canvas";
import { escapeHtml } from "@/lib/common/escape-html";
import { splashShowsCompanyLogo } from "@/lib/proposal/splash-branding";
import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";

export function renderSplashBlock({
  block,
  proposalContext,
}: ProposalBlockViewProps): React.ReactNode {
  const s = block as SplashBlock;
  const pub = s.html?.trim() ? s.html : s.body ? `<p>${escapeHtml(s.body)}</p>` : "<p></p>";
  const splashLogo =
    proposalContext?.brandingLogoUrl &&
    splashShowsCompanyLogo(s, proposalContext.brandingLogoUrl, proposalContext.firstRootSplashBlockId ?? null)
      ? proposalContext.brandingLogoUrl
      : null;
  return (
    <ProposalSplashBlockCanvas
      block={s}
      mode="public"
      publicHtml={pub}
      presentation="editor"
      logoUrl={splashLogo}
    />
  );
}
