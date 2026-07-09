"use client";

import type { AgreementBlock } from "@/types/proposal";
import { AgreementBlockPublic } from "@/components/features/proposal/viewer/agreement/agreement-block-public";
import { ProposalSectionShell } from "@/components/features/proposal/editor/section-chrome/proposal-section-shell";
import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";
import {
  PROPOSAL_DOCUMENT_BLOCK_INNER_PAD_CLASSES,
  PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES,
} from "@/lib/proposal/public/public-layout";
import { isSectionBackgroundActive } from "@/lib/proposal/section-background";
import { cn } from "@/lib/utils";

export function renderAgreementBlock({
  block,
  shareToken,
  publicSelections,
  viewportSectionBleed,
  proposalContext,
  renderBlock,
}: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "agreement") return null;
  const ab = block as AgreementBlock;
  const agreementInner = (
    <AgreementBlockPublic
      block={ab}
      allBlocks={proposalContext?.allBlocks ?? []}
      shareToken={shareToken}
      publicSelections={publicSelections}
      proposalStatus={proposalContext?.proposalStatus}
      acceptedByName={proposalContext?.acceptedByName}
      acceptedSignerOrganization={proposalContext?.acceptedSignerOrganization}
      acceptedSignatureDataUrl={proposalContext?.acceptedSignatureDataUrl}
      acceptedAt={proposalContext?.acceptedAt}
      localityTimeZone={proposalContext?.localityTimeZone}
      interactive={Boolean(shareToken)}
      publicSubscriptionUi={proposalContext?.publicSubscriptionUi}
      customerSignerPrefill={proposalContext?.customerSignerPrefill}
      catalogServices={proposalContext?.catalogServices}
      stripePublishableKey={proposalContext?.stripePublishableKey}
      companyPrintName={proposalContext?.companyPrintName}
      frozenSignedAgreement={proposalContext?.frozenSignedAgreement}
      renderAgreementChild={(child) => renderBlock(child)}
    />
  );
  const backdropActive = isSectionBackgroundActive(ab.background);
  const body = (
    <div className={cn(PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES, PROPOSAL_DOCUMENT_BLOCK_INNER_PAD_CLASSES)}>
      {agreementInner}
    </div>
  );
  return (
    <ProposalSectionShell
      background={ab.background}
      variant="viewer"
      viewportBleed={Boolean(viewportSectionBleed)}
    >
      {backdropActive ? body : agreementInner}
    </ProposalSectionShell>
  );
}
