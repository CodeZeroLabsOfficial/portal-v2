import type { ProposalBlock, ProposalContentBlock, SectionBlock } from "@/types/proposal";

export function isSingleLayoutSection(block: ProposalBlock): block is SectionBlock {
  return block.type === "section" && block.layout === "single";
}

export function singleLayoutSectionChild(block: SectionBlock): ProposalContentBlock | undefined {
  return block.children[0];
}
