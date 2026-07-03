"use client";

import * as React from "react";
import { GripVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROPOSAL_EDITOR_SECTION_CHILD_INSERT_HOST_CLASSES } from "@/lib/proposal/public/public-layout";

/** Reserved width for the floating block gutter — pair with stack `pl-*`. */
export const SECTION_CHILD_GUTTER_INSET_CLASSES = "pl-[4.25rem] sm:pl-[4.5rem]";

/** Left rail beside section-child rows — fits [+][⋮⋮] with a hover bridge into content. */
export const SECTION_CHILD_GUTTER_CLASSES = cn(
  "flex shrink-0 items-start gap-0.5 pt-1.5 pr-1 -mr-1.5",
  "w-[4.25rem] sm:w-[4.5rem]",
  "transition-[opacity,visibility] duration-150 ease-out",
);

/** @deprecated Use {@link SECTION_CHILD_GUTTER_CLASSES}. */
export const SECTION_CHILD_DRAG_GUTTER_CLASSES = SECTION_CHILD_GUTTER_CLASSES;

export const SECTION_CHILD_GUTTER_BUTTON_CLASSES = cn(
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md p-0",
  "border border-border/80 bg-background text-muted-foreground shadow-sm",
  "transition-[color,background-color,border-color,transform] duration-150 ease-out",
  "hover:border-primary/50 hover:bg-background hover:text-primary hover:scale-105",
  "active:scale-100",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "data-[state=open]:border-primary data-[state=open]:bg-primary data-[state=open]:text-primary-foreground",
);

export const SECTION_CHILD_DRAG_HANDLE_CLASSES = cn(
  SECTION_CHILD_GUTTER_BUTTON_CLASSES,
  "touch-none cursor-grab active:cursor-grabbing",
);

export function SectionChildPlusTrigger({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="Add content below"
      className={cn(SECTION_CHILD_GUTTER_BUTTON_CLASSES, className)}
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
  return (
    <button type="button" className={cn(SECTION_CHILD_DRAG_HANDLE_CLASSES, className)} {...props}>
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

/** Past the stack inset — top-of-stack insert aligns with the floating gutter column. */
const SECTION_CHILD_INSERT_LEFT_CLASSES = "-left-[4.25rem] sm:-left-[4.5rem]";

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
  const trigger = (
    <button
      type="button"
      aria-label="Add content at top"
      className={cn(
        "pointer-events-auto absolute top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full p-0",
        SECTION_CHILD_INSERT_LEFT_CLASSES,
        SECTION_CHILD_GUTTER_BUTTON_CLASSES,
        "rounded-full",
        "opacity-0 transition-[opacity,border-color,color,background-color,transform] duration-150",
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
