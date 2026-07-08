"use client";

import type { SectionBlock } from "@/types/proposal";
import { ProposalSectionShell } from "@/components/features/proposal/editor/section-chrome/proposal-section-shell";
import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";
import {
  PROPOSAL_DOCUMENT_BLOCK_INNER_PAD_CLASSES,
  PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES,
} from "@/lib/proposal/public/public-layout";
import { cn } from "@/lib/utils";

export function renderSectionBlock({
  block,
  viewportSectionBleed,
  renderBlock,
  sectionInnerPadClasses,
}: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "section") return null;
  const sb = block as SectionBlock;
  const stack = sb.children.map((c) => renderBlock(c));
  const body = (
    <div
      className={cn(
        PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES,
        sectionInnerPadClasses ?? PROPOSAL_DOCUMENT_BLOCK_INNER_PAD_CLASSES,
      )}
    >
      <div className="flex flex-col">{stack}</div>
    </div>
  );
  return (
    <ProposalSectionShell background={sb.background} variant="viewer" viewportBleed={Boolean(viewportSectionBleed)}>
      {body}
    </ProposalSectionShell>
  );
}
