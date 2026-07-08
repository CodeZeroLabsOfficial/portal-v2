"use client";

import * as React from "react";

import { ProposalImageBlockToolbar } from "@/components/features/proposal/blocks/image/image-block-toolbar";
import { ProposalBlockStylePickerTrigger } from "@/components/features/proposal/editor/toolbar/proposal-block-toolbar";
import { ProposalToolbarShell } from "@/components/features/proposal/editor/toolbar";
import type { BlockStyle, ImageBlock, ProposalBlock } from "@/types/proposal";
import { cn } from "@/lib/utils";

const IMAGE_TOOLBAR_SHELL_CLASS =
  "pointer-events-auto max-w-[calc(100vw-3rem)] shrink-0 flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export interface ImageBlockToolbarSlotProps {
  block: ImageBlock;
  onChange: (next: ImageBlock) => void;
  onDelete?: () => void;
  className?: string;
  /** When set, wraps the toolbar with a drag handle row (root canvas). */
  leadingSlot?: React.ReactNode;
}

/** Shared shell image toolbar — root canvas, section-child stacks, and single-layout bands. */
export function ImageBlockToolbarSlot({
  block,
  onChange,
  onDelete,
  className,
  leadingSlot,
}: ImageBlockToolbarSlotProps) {
  const imageToolbar = (
    <ProposalImageBlockToolbar
      variant="shell"
      block={block}
      onChange={onChange}
      onDelete={onDelete}
      className={cn(IMAGE_TOOLBAR_SHELL_CLASS, className)}
    />
  );

  if (leadingSlot) {
    return (
      <div className="flex w-full items-start justify-between gap-1.5">
        {leadingSlot}
        {imageToolbar}
      </div>
    );
  }

  return imageToolbar;
}

export interface CommerceBlockStyleToolbarSlotProps {
  block: Extract<ProposalBlock, { type: "pricing" | "packages" }>;
  style: BlockStyle | undefined;
  onStyleChange: (next: BlockStyle | undefined) => void;
  className?: string;
}

/** Packages/pricing style picker in a toolbar shell — shared by factory and single-layout stacks. */
export function CommerceBlockStyleToolbarSlot({
  style,
  onStyleChange,
  className,
}: CommerceBlockStyleToolbarSlotProps) {
  return (
    <ProposalToolbarShell
      appearance={undefined}
      className={cn("pointer-events-auto p-1", className)}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <ProposalBlockStylePickerTrigger style={style} onStyleChange={onStyleChange} mode="packages" />
    </ProposalToolbarShell>
  );
}
