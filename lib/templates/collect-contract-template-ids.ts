import { iterateProposalContentBlocks } from "@/lib/proposal/blocks";
import type { AgreementBlock, ProposalDocument } from "@/types/proposal";

/** Unique `contractTemplateId` values on agreement blocks in document order. */
export function collectContractTemplateIds(document: ProposalDocument): string[] {
  const ids = new Set<string>();
  for (const block of iterateProposalContentBlocks(document.blocks)) {
    if (block.type !== "agreement") continue;
    const id = (block as AgreementBlock).contractTemplateId?.trim();
    if (id) ids.add(id);
  }
  return [...ids];
}

/** Contract template ids present in `after` but not in `before`. */
export function diffNewContractTemplateIds(
  before: ProposalDocument,
  after: ProposalDocument,
): string[] {
  const previous = new Set(collectContractTemplateIds(before));
  return collectContractTemplateIds(after).filter((id) => !previous.has(id));
}
