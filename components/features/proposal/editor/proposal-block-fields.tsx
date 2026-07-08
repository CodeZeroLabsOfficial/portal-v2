"use client";

import type * as React from "react";
import type { BlockStyle, ProposalBlock } from "@/types/proposal";
import {
  type ProposalIconColumnToolbarActions,
} from "@/components/features/proposal/blocks/icon/icon-block-toolbar";
import { useProposalSectionEditorChrome } from "@/components/features/proposal/editor/section-chrome/proposal-section-editor-chrome";
import { ProposalBlockCanvas } from "@/components/features/proposal/editor/block-canvas";

export type ProposalImageColumnToolbarActions = {
  onRemove: () => void;
};

export type ProposalBlockFieldsProps = {
  block: ProposalBlock;
  onChange: (next: ProposalBlock) => void;
  selection?: { selectedId: string | null; onSelect: (id: string | null) => void };
  getBlockStyle?: (b: ProposalBlock) => BlockStyle | undefined;
  applyBlockStyle?: (id: string, style: BlockStyle | undefined) => void;
  columnsLayoutEditing?: {
    activeId: string | null;
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
  };
  imageColumnToolbar?: ProposalImageColumnToolbarActions;
  iconColumnToolbar?: ProposalIconColumnToolbarActions;
  columnsInnerCellCallbacks?: {
    onInnerCellActiveChange: (cellId: string | null) => void;
    registerClearCellSelection: (clear: (() => void) | null) => void;
  };
  formattingChrome?: "bubble" | "band";
};

export function ProposalBlockFields({
  block,
  onChange,
  selection,
  getBlockStyle,
  applyBlockStyle,
  columnsLayoutEditing,
  columnsInnerCellCallbacks,
  imageColumnToolbar,
  iconColumnToolbar,
  formattingChrome,
}: ProposalBlockFieldsProps) {
  const sectionChrome = useProposalSectionEditorChrome();
  const seamlessSection = sectionChrome?.seamless ?? false;

  return (
    <ProposalBlockCanvas
      block={block}
      onChange={onChange}
      selectedBlockId={selection?.selectedId}
      onSelectBlock={selection?.onSelect}
      seamlessSection={seamlessSection}
      editableSurface={seamlessSection ? "section-child" : null}
      imageColumnToolbar={imageColumnToolbar}
      iconColumnToolbar={iconColumnToolbar}
      formattingChrome={formattingChrome}
      getBlockStyle={getBlockStyle}
      applyBlockStyle={applyBlockStyle}
      columnsLayoutEditing={columnsLayoutEditing}
      columnsInnerCellCallbacks={columnsInnerCellCallbacks}
    />
  );
}

export { BlockMenuProfileContext, useBlockMenuProfile } from "@/components/features/proposal/editor/block-menu-profile-context";
export { useColumnsInnerCellChrome } from "@/components/features/proposal/editor/columns-inner-cell-chrome";
export { ColumnsBlockFields } from "@/components/features/proposal/blocks/columns/fields";
export { SectionBlockFields } from "@/components/features/proposal/blocks/section/fields";
export { AgreementBlockFields } from "@/components/features/proposal/blocks/agreement/fields";
