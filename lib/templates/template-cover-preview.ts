import type { ProposalBlock, ProposalDocument } from "@/types/proposal";

/** First root block rendered as the proposal template hub card thumbnail. */
export function resolveTemplateCoverPreviewBlocks(document?: ProposalDocument): ProposalBlock[] {
  const first = document?.blocks?.[0];
  return first ? [first] : [];
}
