"use client";

import { SectionBlockFields } from "@/components/features/proposal/editor/proposal-block-fields";
import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import type { BlockStyle, ProposalBlock, SectionBlock } from "@/types/proposal";

export interface SectionBlockEditorProps extends BlockEditorProps<SectionBlock> {
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  getBlockStyle?: (b: ProposalBlock) => BlockStyle | undefined;
  applyBlockStyle?: (id: string, style: BlockStyle | undefined) => void;
}

export function SectionBlockEditor({
  block,
  onChange,
  selectedBlockId = null,
  onSelectBlock = () => {},
  getBlockStyle = () => undefined,
  applyBlockStyle = () => {},
}: SectionBlockEditorProps) {
  return (
    <SectionBlockFields
      block={block}
      onChange={onChange as (next: ProposalBlock) => void}
      selectedBlockId={selectedBlockId}
      onSelectBlock={onSelectBlock}
      getBlockStyle={getBlockStyle}
      applyBlockStyle={applyBlockStyle}
    />
  );
}
