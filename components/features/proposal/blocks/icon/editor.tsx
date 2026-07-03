"use client";

import { ProposalIconBlockEditorRow } from "@/components/proposal/proposal-icon-block-editor";
import { ProposalIconBlockToolbar } from "@/components/proposal/proposal-icon-block-toolbar";
import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import type { IconBlock } from "@/types/proposal";

export interface IconBlockEditorProps extends BlockEditorProps<IconBlock> {
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string) => void;
  columnToolbar?: { onRemove: () => void };
}

export function IconBlockEditor({
  block,
  onChange,
  selectedBlockId,
  onSelectBlock,
  columnToolbar,
}: IconBlockEditorProps) {
  const isSelected = selectedBlockId === block.id;

  return (
    <ProposalIconBlockEditorRow
      block={block}
      onChange={onChange}
      isSelected={isSelected}
      onSelect={() => onSelectBlock?.(block.id)}
      toolbar={
        <ProposalIconBlockToolbar
          variant="embedded"
          block={block}
          onChange={onChange}
          onRemove={columnToolbar?.onRemove}
        />
      }
    />
  );
}
