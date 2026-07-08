"use client";

import * as React from "react";

import { ProposalImageBlockToolbar } from "@/components/proposal/proposal-image-block-toolbar";
import { ProposalBlockStylePickerTrigger } from "@/components/proposal/proposal-block-toolbar";
import { RichTextFormattingToolbar } from "@/components/features/proposal/rich-text/v2/proposal-rich-text-editor";
import { ProposalToolbarShell } from "@/components/features/proposal/editor/toolbar";
import { useSingleSectionRichTextEditor } from "@/components/features/proposal/editor/single-section-rich-text-bridge";
import type { BlockStyle, ImageBlock, ProposalContentBlock } from "@/types/proposal";
import { cn } from "@/lib/utils";

export { SingleSectionRichTextEditorProvider } from "@/components/features/proposal/editor/single-section-rich-text-bridge";

const RICH_TEXT_CHILD_TYPES = new Set<ProposalContentBlock["type"]>(["text", "header"]);

export interface SingleSectionToolbarStackProps {
  sectionToolbar: React.ReactNode;
  child: ProposalContentBlock;
  /** Section row or nested child is active — keeps both chrome layers visible together. */
  active: boolean;
  onUpdateChild: (next: ProposalContentBlock) => void;
  getBlockStyle: (block: ProposalContentBlock) => BlockStyle | undefined;
  applyBlockStyle: (id: string, style: BlockStyle | undefined) => void;
}

/** Section pill + block-type controls stacked in the inside-band corner. */
export function SingleSectionToolbarStack({
  sectionToolbar,
  child,
  active,
  onUpdateChild,
  getBlockStyle,
  applyBlockStyle,
}: SingleSectionToolbarStackProps) {
  const childToolbar = (
    <SingleSectionChildToolbar
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

interface SingleSectionChildToolbarProps {
  child: ProposalContentBlock;
  active: boolean;
  onUpdateChild: (next: ProposalContentBlock) => void;
  getBlockStyle: (block: ProposalContentBlock) => BlockStyle | undefined;
  applyBlockStyle: (id: string, style: BlockStyle | undefined) => void;
}

function SingleSectionChildToolbar({
  child,
  active,
  onUpdateChild,
  getBlockStyle,
  applyBlockStyle,
}: SingleSectionChildToolbarProps) {
  const richTextBridge = useSingleSectionRichTextEditor();

  if (!active) return null;

  if (RICH_TEXT_CHILD_TYPES.has(child.type)) {
    if (!richTextBridge?.editor) return null;
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
          <RichTextFormattingToolbar editor={richTextBridge.editor} />
        </div>
      </ProposalToolbarShell>
    );
  }

  if (child.type === "image") {
    return (
      <ProposalImageBlockToolbar
        variant="shell"
        block={child as ImageBlock}
        onChange={(next) => onUpdateChild(next)}
        className="pointer-events-auto max-w-[calc(100vw-3rem)]"
      />
    );
  }

  if (child.type === "pricing" || child.type === "packages") {
    return (
      <ProposalToolbarShell
        appearance={undefined}
        className="pointer-events-auto p-1"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <ProposalBlockStylePickerTrigger
          style={getBlockStyle(child)}
          onStyleChange={(next) => applyBlockStyle(child.id, next)}
          mode="packages"
        />
      </ProposalToolbarShell>
    );
  }

  return null;
}
