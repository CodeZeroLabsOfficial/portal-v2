"use client";

import * as React from "react";

import { useProposalSectionEditorChrome } from "@/components/proposal/proposal-section-editor-chrome";
import { PROPOSAL_CANVAS_SURFACE_LIGHT_CLASSES } from "@/lib/proposal/editor-surface-tokens";
import { cn } from "@/lib/utils";

export interface BlockSelectionProps {
  variant?: "root" | "section-child";
  selected: boolean;
  hovered: boolean;
  isDragging: boolean;
  /** Flush backdrop band — no vertical padding around the band content. */
  flush?: boolean;
  /** Root-level block outside a section — remap tokens for dark admin chrome over a light canvas. */
  lightSurface?: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

/**
 * Selection ring + click policy around a block's content.
 *
 * Clicks inside nested editable content don't select the row (they go to the editor),
 * EXCEPT Cmd/Ctrl+click on section-child content, which selects the row without
 * blocking regular edit clicks.
 */
export function BlockSelection({
  variant = "root",
  selected,
  hovered,
  isDragging,
  flush = false,
  lightSurface = false,
  onSelect,
  children,
}: BlockSelectionProps) {
  const sectionChrome = useProposalSectionEditorChrome();
  const seamless = sectionChrome?.seamless ?? false;
  const elevatedSection = sectionChrome?.appearance === "elevated";
  const sectionChild = variant === "section-child";

  const sectionChildRingClasses = cn(
    "rounded-sm ring-1 ring-offset-0 transition-[box-shadow] duration-150",
    elevatedSection
      ? selected || isDragging
        ? "ring-white/45"
        : hovered
          ? "ring-white/35"
          : "ring-transparent"
      : selected || isDragging
        ? "ring-sky-500/70"
        : hovered
          ? "ring-border/55"
          : "ring-transparent",
  );

  const ringClasses = seamless
    ? cn(
        "transition-none",
        sectionChild
          ? sectionChildRingClasses
          : selected
            ? elevatedSection
              ? "rounded-sm ring-1 ring-white/40 ring-offset-0"
              : "rounded-sm ring-1 ring-sky-500/70 ring-offset-0"
            : "rounded-sm",
        "!bg-transparent hover:!bg-transparent focus-within:!bg-transparent active:!bg-transparent",
        "dark:!bg-transparent dark:hover:!bg-transparent dark:focus-within:!bg-transparent dark:active:!bg-transparent",
      )
    : cn(
        "transition-colors",
        selected
          ? "rounded-sm ring-1 ring-primary/45 ring-offset-2 ring-offset-transparent"
          : sectionChild
            ? sectionChildRingClasses
            : "rounded-[2px] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]",
      );

  return (
    <div
      role="presentation"
      onClick={(e) => {
        const el = e.target as HTMLElement;
        if (el.closest("[data-proposal-columns-content]")) return;
        if (el.closest("[data-proposal-section-child-content]") && !(e.metaKey || e.ctrlKey)) {
          return;
        }
        e.stopPropagation();
        onSelect();
      }}
      className={cn(
        "relative min-w-0 [-webkit-tap-highlight-color:transparent]",
        !sectionChild && "px-0",
        !sectionChild && (flush ? "py-0" : "py-1.5"),
        sectionChild && "py-0.5",
        lightSurface && PROPOSAL_CANVAS_SURFACE_LIGHT_CLASSES,
        ringClasses,
      )}
    >
      <div className="min-w-0">{children}</div>
    </div>
  );
}
