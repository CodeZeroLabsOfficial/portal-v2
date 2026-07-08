"use client";

import * as React from "react";

import {
  type BlockCanvasContext,
  getBlockDefinition,
} from "@/components/features/proposal/blocks/block-editor-registry";
import type { BlockStyle, ProposalBlock } from "@/types/proposal";

export interface ProposalColumnImageToolbarActions {
  onRemove: () => void;
}

export interface ProposalColumnIconToolbarActions {
  onRemove: () => void;
}

export interface ProposalBlockCanvasProps {
  block: ProposalBlock;
  onChange: (next: ProposalBlock) => void;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  /** Rich-text placeholder when editing inside a column cell. */
  textPlaceholder?: string;
  /** Wrap rich-text blocks when editing inside a seamless section band. */
  seamlessSection?: boolean;
  /** When set, wraps output in section-child editable surface (stops row selection). */
  editableSurface?: "section-child" | "column-cell" | null;
  /** Columns only: image remove is on the floating toolbar when the cell is selected. */
  imageColumnToolbar?: ProposalColumnImageToolbarActions;
  /** Columns only: icon picker + remove on the floating toolbar when the cell is selected. */
  iconColumnToolbar?: ProposalColumnIconToolbarActions;
  /** Rich-text formatting UI: floating bubble (default) or stacked single-layout band toolbar. */
  formattingChrome?: "bubble" | "band";
  getBlockStyle?: (b: ProposalBlock) => BlockStyle | undefined;
  applyBlockStyle?: (id: string, style: BlockStyle | undefined) => void;
  columnsLayoutEditing?: {
    activeId: string | null;
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
  };
  columnsInnerCellCallbacks?: {
    onInnerCellActiveChange: (cellId: string | null) => void;
    registerClearCellSelection: (clear: (() => void) | null) => void;
  };
}

function BlockEditableSurface({
  enabled,
  marker,
  children,
}: {
  enabled: boolean;
  marker: "section-child" | "column-cell";
  children: React.ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <div
      {...(marker === "column-cell"
        ? { "data-proposal-column-cell-content": true }
        : { "data-proposal-section-child-content": true })}
      className="min-w-0"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function isRegistryCanvasBlock(type: ProposalBlock["type"]): boolean {
  return Boolean(getBlockDefinition(type)?.Editor);
}

function buildCanvasContext(props: ProposalBlockCanvasProps): BlockCanvasContext {
  return {
    selectedBlockId: props.selectedBlockId,
    onSelectBlock: props.onSelectBlock,
    textPlaceholder: props.textPlaceholder,
    seamlessSection: props.seamlessSection,
    editableSurface: props.editableSurface,
    formattingChrome: props.formattingChrome,
    getBlockStyle: props.getBlockStyle,
    applyBlockStyle: props.applyBlockStyle,
    imageColumnToolbar: props.imageColumnToolbar,
    iconColumnToolbar: props.iconColumnToolbar,
    columnsLayoutEditing: props.columnsLayoutEditing,
    columnsInnerCellCallbacks: props.columnsInnerCellCallbacks,
  };
}

const RICH_TEXT_BLOCK_TYPES = new Set<ProposalBlock["type"]>(["text", "header"]);

/**
 * Dispatches to the block-editor registry `Editor` for the given block type.
 */
export function ProposalBlockCanvas({
  block,
  onChange,
  seamlessSection = false,
  editableSurface = null,
  formattingChrome = "bubble",
  ...rest
}: ProposalBlockCanvasProps): React.ReactNode {
  const definition = getBlockDefinition(block.type);
  const Editor = definition?.Editor;
  if (!Editor) return null;

  const canvas = buildCanvasContext({
    block,
    onChange,
    seamlessSection,
    editableSurface,
    formattingChrome,
    ...rest,
  });

  const node = <Editor block={block} onChange={onChange} canvas={canvas} />;

  if (!RICH_TEXT_BLOCK_TYPES.has(block.type)) {
    return node;
  }

  if (!editableSurface) return node;
  const enabled = editableSurface === "column-cell" ? true : seamlessSection;
  return (
    <BlockEditableSurface enabled={enabled} marker={editableSurface}>
      {node}
    </BlockEditableSurface>
  );
}
