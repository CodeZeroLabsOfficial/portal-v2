"use client";

import * as React from "react";

import { CommerceBlockStyleToolbarSlot, ImageBlockToolbarSlot } from "@/components/features/proposal/editor/block-toolbar-slots";
import { RichTextFormattingToolbar } from "@/components/features/proposal/rich-text/v2/proposal-rich-text-editor";
import { ProposalToolbarShell } from "@/components/features/proposal/editor/toolbar";
import { useProposalSingleLayoutRichTextEditorOptional } from "@/components/features/proposal/editor/single-layout-rich-text-context";
import type { BlockStyle, ImageBlock, ProposalContentBlock } from "@/types/proposal";
import { cn } from "@/lib/utils";

const RICH_TEXT_CHILD_TYPES = new Set<ProposalContentBlock["type"]>(["text", "header"]);

export interface ProposalSingleLayoutToolbarStackProps {
  sectionToolbar: React.ReactNode;
  child: ProposalContentBlock;
  /** Section row or nested child is active — keeps both chrome layers visible together. */
  active: boolean;
  onUpdateChild: (next: ProposalContentBlock) => void;
  getBlockStyle: (block: ProposalContentBlock) => BlockStyle | undefined;
  applyBlockStyle: (id: string, style: BlockStyle | undefined) => void;
}

/** Section pill + block-type controls stacked in the inside-band corner. */
export function ProposalSingleLayoutToolbarStack({
  sectionToolbar,
  child,
  active,
  onUpdateChild,
  getBlockStyle,
  applyBlockStyle,
}: ProposalSingleLayoutToolbarStackProps) {
  const childToolbar = (
    <SingleLayoutChildToolbar
      child={child}
      active={active}
      onUpdateChild={onUpdateChild}
      getBlockStyle={getBlockStyle}
      applyBlockStyle={applyBlockStyle}
    />
  );

  return (
    <div className="flex max-w-[calc(100vw-3rem)] flex-col items-end gap-1.5">
      {sectionToolbar}
      {childToolbar}
    </div>
  );
}

interface SingleLayoutChildToolbarProps {
  child: ProposalContentBlock;
  active: boolean;
  onUpdateChild: (next: ProposalContentBlock) => void;
  getBlockStyle: (block: ProposalContentBlock) => BlockStyle | undefined;
  applyBlockStyle: (id: string, style: BlockStyle | undefined) => void;
}

function SingleLayoutChildToolbar({
  child,
  active,
  onUpdateChild,
  getBlockStyle,
  applyBlockStyle,
}: SingleLayoutChildToolbarProps) {
  const richTextContext = useProposalSingleLayoutRichTextEditorOptional();

  if (!active) return null;

  if (RICH_TEXT_CHILD_TYPES.has(child.type)) {
    if (!richTextContext?.editor) return null;
    return (
      <ProposalToolbarShell
        appearance={undefined}
        className={cn(
          "pointer-events-auto max-w-[calc(100vw-3rem)] overflow-x-auto p-1",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-max flex-nowrap items-center gap-0.5">
          <RichTextFormattingToolbar editor={richTextContext.editor} />
        </div>
      </ProposalToolbarShell>
    );
  }

  if (child.type === "image") {
    return (
      <ImageBlockToolbarSlot
        block={child as ImageBlock}
        onChange={(next) => onUpdateChild(next)}
        className="max-w-[calc(100vw-3rem)]"
      />
    );
  }

  if (child.type === "pricing" || child.type === "packages") {
    return (
      <CommerceBlockStyleToolbarSlot
        block={child}
        style={getBlockStyle(child)}
        onStyleChange={(next) => applyBlockStyle(child.id, next)}
      />
    );
  }

  return null;
}
