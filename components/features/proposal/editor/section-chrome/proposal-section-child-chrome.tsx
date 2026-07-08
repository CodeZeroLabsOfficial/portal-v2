"use client";

import * as React from "react";
import { GripVertical, Plus } from "lucide-react";
import {
  proposalSectionGutterDragHandleClasses,
  proposalSectionInCanvasControlClasses,
} from "@/lib/proposal/editor-toolbar-tokens";
import { PROPOSAL_EDITOR_SECTION_CHILD_INSERT_HOST_CLASSES } from "@/lib/proposal/public/public-layout";
import { cn } from "@/lib/utils";
import { useProposalSectionEditorAppearance } from "@/components/features/proposal/editor/section-chrome/proposal-section-editor-chrome";

/** Overlay rail beside section-child rows — fits [+][⋮⋮] with a hover bridge into content. */
export const SECTION_CHILD_GUTTER_CLASSES = cn(
  "flex shrink-0 items-start gap-0.5 pt-1.5 pr-1 -mr-1.5",
  "w-[4.25rem] sm:w-[4.5rem]",
  "transition-[opacity,visibility] duration-150 ease-out",
);

export function SectionChildPlusTrigger({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const appearance = useProposalSectionEditorAppearance();
  return (
    <button
      type="button"
      aria-label="Add content below"
      className={cn(proposalSectionInCanvasControlClasses(appearance, "square"), className)}
      {...props}
    >
      <Plus className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

export function SectionChildDragHandle({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const appearance = useProposalSectionEditorAppearance();
  return (
    <button
      type="button"
      className={cn(proposalSectionGutterDragHandleClasses(appearance), className)}
      {...props}
    >
      <GripVertical className="h-4 w-4" aria-hidden />
    </button>
  );
}

/**
 * Notion-style block gutter: `+` (insert below) and drag notch appear together on row hover.
 */
export function SectionChildBlockGutter({
  visible,
  insertMenu,
  dragHandle,
}: {
  visible: boolean;
  insertMenu: (trigger: React.ReactNode) => React.ReactNode;
  dragHandle: React.ReactNode;
}) {
  return (
    <div
      data-section-drag-gutter
      className={cn(
        SECTION_CHILD_GUTTER_CLASSES,
        visible
          ? "visible pointer-events-auto opacity-100"
          : "invisible pointer-events-none opacity-0",
        "has-[[data-state=open]]:visible has-[[data-state=open]]:pointer-events-auto has-[[data-state=open]]:opacity-100",
      )}
    >
      {insertMenu(<SectionChildPlusTrigger />)}
      {dragHandle}
    </div>
  );
}

/** Aligns the top-of-stack insert with the overlay gutter rail (outside the content column). */
const SECTION_CHILD_INSERT_LEFT_CLASSES = "right-full mr-3 left-auto";

/**
 * Insert above the first child in a section stack — seam-only; between-row inserts use
 * {@link SectionChildBlockGutter} on each row.
 */
export function SectionChildInsertSlot({
  menu,
  className,
}: {
  menu: (trigger: React.ReactNode) => React.ReactNode;
  className?: string;
}) {
  const appearance = useProposalSectionEditorAppearance();

  const trigger = (
    <button
      type="button"
      aria-label="Add content at top"
      className={cn(
        "pointer-events-auto absolute top-1/2 z-20 -translate-y-1/2",
        SECTION_CHILD_INSERT_LEFT_CLASSES,
        proposalSectionInCanvasControlClasses(appearance, "square"),
        "opacity-0 transition-opacity duration-150",
        "group-hover/section-insert:opacity-100",
        "group-focus-within/section-insert:opacity-100",
        "focus-visible:opacity-100",
        "data-[state=open]:opacity-100",
      )}
    >
      <Plus className="h-3.5 w-3.5" aria-hidden />
    </button>
  );

  return (
    <div
      className={cn(
        "group/section-insert pointer-events-none z-20",
        PROPOSAL_EDITOR_SECTION_CHILD_INSERT_HOST_CLASSES,
        className,
      )}
    >
      {menu(trigger)}
    </div>
  );
}
