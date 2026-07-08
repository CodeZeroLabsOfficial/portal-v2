"use client";

import { ProposalIconBlockEditorRow } from "@/components/features/proposal/blocks/icon/icon-block-editor";
import { ProposalIconBlockToolbar } from "@/components/features/proposal/blocks/icon/icon-block-toolbar";
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
  canvas,
  selectedBlockId,
  onSelectBlock,
  columnToolbar,
}: IconBlockEditorProps) {
  const resolvedSelectedId = selectedBlockId ?? canvas?.selectedBlockId;
  const resolvedOnSelect = onSelectBlock ?? canvas?.onSelectBlock;
  const resolvedColumnToolbar = columnToolbar ?? canvas?.iconColumnToolbar;
  const isSelected = resolvedSelectedId === block.id;

  return (
    <ProposalIconBlockEditorRow
      block={block}
      onChange={onChange}
      isSelected={isSelected}
      onSelect={() => resolvedOnSelect?.(block.id)}
      toolbar={
        <ProposalIconBlockToolbar
          variant="embedded"
          block={block}
          onChange={onChange}
          onRemove={resolvedColumnToolbar?.onRemove}
        />
      }
    />
  );
}
