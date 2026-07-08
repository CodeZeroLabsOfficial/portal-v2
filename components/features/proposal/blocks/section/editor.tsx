"use client";

import { SectionBlockFields } from "./fields";
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
  canvas,
  selectedBlockId,
  onSelectBlock,
  getBlockStyle,
  applyBlockStyle,
}: SectionBlockEditorProps) {
  return (
    <SectionBlockFields
      block={block}
      onChange={onChange as (next: ProposalBlock) => void}
      selectedBlockId={selectedBlockId ?? canvas?.selectedBlockId ?? null}
      onSelectBlock={onSelectBlock ?? canvas?.onSelectBlock ?? (() => {})}
      getBlockStyle={getBlockStyle ?? canvas?.getBlockStyle ?? (() => undefined)}
      applyBlockStyle={applyBlockStyle ?? canvas?.applyBlockStyle ?? (() => {})}
    />
  );
}
