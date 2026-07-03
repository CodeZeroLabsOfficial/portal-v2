"use client";

import { ProposalImageBlockEditor } from "@/components/proposal/proposal-image-block-editor";
import { ProposalImageBlockToolbar } from "@/components/proposal/proposal-image-block-toolbar";
import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import type { ImageBlock } from "@/types/proposal";

export interface ImageBlockEditorProps extends BlockEditorProps<ImageBlock> {
  selectedBlockId?: string | null;
  columnToolbar?: { onRemove: () => void };
}

export function ImageBlockEditor({
  block,
  onChange,
  selectedBlockId,
  columnToolbar,
}: ImageBlockEditorProps) {
  const showEmbeddedColumnToolbar = Boolean(columnToolbar) && selectedBlockId === block.id;

  return (
    <div className="relative">
      {showEmbeddedColumnToolbar ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 -translate-y-full pb-1.5 pt-2">
          <div className="pointer-events-auto flex w-full flex-wrap items-start justify-end gap-1.5">
            <ProposalImageBlockToolbar
              variant="embedded"
              block={block}
              onChange={onChange}
              onDelete={columnToolbar?.onRemove}
            />
          </div>
        </div>
      ) : null}
      <ProposalImageBlockEditor block={block} onChange={onChange} />
    </div>
  );
}
