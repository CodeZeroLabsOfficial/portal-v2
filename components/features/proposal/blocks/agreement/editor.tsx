"use client";

import { AgreementBlockFields } from "./fields";
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
  canvas,
  selectedBlockId,
  onSelectBlock,
  getBlockStyle,
  applyBlockStyle,
}: AgreementBlockEditorProps) {
  return (
    <AgreementBlockFields
      block={block}
      onChange={onChange as (next: ProposalBlock) => void}
      selectedBlockId={selectedBlockId ?? canvas?.selectedBlockId ?? null}
      onSelectBlock={onSelectBlock ?? canvas?.onSelectBlock ?? (() => {})}
      getBlockStyle={getBlockStyle ?? canvas?.getBlockStyle ?? (() => undefined)}
      applyBlockStyle={applyBlockStyle ?? canvas?.applyBlockStyle ?? (() => {})}
    />
  );
}
