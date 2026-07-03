"use client";

import { AgreementBlockFields } from "@/components/features/proposal/editor/proposal-block-fields";
import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import type { AgreementBlock, BlockStyle, ProposalBlock } from "@/types/proposal";

export interface AgreementBlockEditorProps extends BlockEditorProps<AgreementBlock> {
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  getBlockStyle?: (b: ProposalBlock) => BlockStyle | undefined;
  applyBlockStyle?: (id: string, style: BlockStyle | undefined) => void;
}

export function AgreementBlockEditor({
  block,
  onChange,
  selectedBlockId = null,
  onSelectBlock = () => {},
  getBlockStyle = () => undefined,
  applyBlockStyle = () => {},
}: AgreementBlockEditorProps) {
  return (
    <AgreementBlockFields
      block={block}
      onChange={onChange as (next: ProposalBlock) => void}
      selectedBlockId={selectedBlockId}
      onSelectBlock={onSelectBlock}
      getBlockStyle={getBlockStyle}
      applyBlockStyle={applyBlockStyle}
    />
  );
}
