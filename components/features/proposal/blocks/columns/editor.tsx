"use client";

import { ColumnsBlockFields } from "@/components/features/proposal/editor/proposal-block-fields";
import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import type { ColumnsBlock } from "@/types/proposal";

export interface ColumnsBlockEditorProps extends BlockEditorProps<ColumnsBlock> {
  resizeLayoutActive?: boolean;
  onExitResizeLayout?: () => void;
  ancestorSelectedBlockId?: string | null;
  onInnerCellActiveChange?: (cellId: string | null) => void;
  registerClearCellSelection?: (clear: (() => void) | null) => void;
}

export function ColumnsBlockEditor({
  block,
  onChange,
  resizeLayoutActive,
  onExitResizeLayout,
  ancestorSelectedBlockId = null,
  onInnerCellActiveChange,
  registerClearCellSelection,
}: ColumnsBlockEditorProps) {
  return (
    <ColumnsBlockFields
      block={block}
      onChange={onChange}
      resizeLayoutActive={resizeLayoutActive}
      onExitResizeLayout={onExitResizeLayout}
      ancestorSelectedBlockId={ancestorSelectedBlockId}
      onInnerCellActiveChange={onInnerCellActiveChange}
      registerClearCellSelection={registerClearCellSelection}
    />
  );
}
