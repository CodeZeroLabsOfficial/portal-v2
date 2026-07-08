"use client";

import type { PackagesBlock } from "@/types/proposal";
import { PackagesBlockPublic } from "@/components/features/proposal/blocks/packages/public";
import { ProposalSectionShell } from "@/components/features/proposal/editor/section-chrome/proposal-section-shell";
import { isPublicProposalPackageSelectionsLocked } from "@/lib/proposal/commerce/package-selection";
import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";
import {
  PROPOSAL_DOCUMENT_BLOCK_INNER_PAD_CLASSES,
  PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES,
} from "@/lib/proposal/public/public-layout";
import { isSectionBackgroundActive } from "@/lib/proposal/section-background";
import { cn } from "@/lib/utils";

export function renderPackagesBlock({
  block,
  shareToken,
  publicSelections,
  viewportSectionBleed,
  proposalContext,
}: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "packages") return null;
  const pb = block as PackagesBlock;
  const packagesInteractive =
    Boolean(shareToken) && !isPublicProposalPackageSelectionsLocked(proposalContext?.proposalStatus);
  const packagesInner = (
    <PackagesBlockPublic
      block={pb}
      shareToken={shareToken ?? ""}
      initialSelection={publicSelections?.[pb.id]}
      interactive={packagesInteractive}
    />
  );
  const backdropActive = isSectionBackgroundActive(pb.background);
  const body = (
    <div className={cn(PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES, PROPOSAL_DOCUMENT_BLOCK_INNER_PAD_CLASSES)}>
      {packagesInner}
    </div>
  );
  return (
    <ProposalSectionShell
      background={pb.background}
      variant="viewer"
      viewportBleed={Boolean(viewportSectionBleed)}
    >
      {backdropActive ? body : packagesInner}
    </ProposalSectionShell>
  );
}
