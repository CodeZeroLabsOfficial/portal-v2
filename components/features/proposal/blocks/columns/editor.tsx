"use client";

import { ColumnsBlockFields } from "./fields";
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
  canvas,
  resizeLayoutActive,
  onExitResizeLayout,
  ancestorSelectedBlockId,
  onInnerCellActiveChange,
  registerClearCellSelection,
}: ColumnsBlockEditorProps) {
  const layoutEditing = canvas?.columnsLayoutEditing;
  const innerCallbacks = canvas?.columnsInnerCellCallbacks;

  return (
    <ColumnsBlockFields
      block={block}
      onChange={onChange}
      resizeLayoutActive={resizeLayoutActive ?? layoutEditing?.activeId === block.id}
      onExitResizeLayout={onExitResizeLayout ?? (() => layoutEditing?.setActiveId(null))}
      ancestorSelectedBlockId={ancestorSelectedBlockId ?? canvas?.selectedBlockId ?? null}
      onInnerCellActiveChange={onInnerCellActiveChange ?? innerCallbacks?.onInnerCellActiveChange}
      registerClearCellSelection={registerClearCellSelection ?? innerCallbacks?.registerClearCellSelection}
    />
  );
}
