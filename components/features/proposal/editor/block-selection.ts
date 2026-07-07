import { cn } from "@/lib/utils";
import type { BlockSelectionPolicy } from "@/lib/proposal/block-chrome";

interface BlockRingArgs {
  /** Inside a seamless section band (transparent surface, no hover fill). */
  seamless: boolean;
  /** Section band prefers light foreground (dark fill) — brighten the selection ring. */
  elevatedSection: boolean;
  /** Row is a section/agreement child (subtle ring on hover + select). */
  sectionChild: boolean;
  selected: boolean;
  hovered: boolean;
  isDragging: boolean;
}

/** Selection/hover ring for a block row, matching band chrome (seamless vs canvas). */
export function blockSelectionRingClasses({
  seamless,
  elevatedSection,
  sectionChild,
  selected,
  hovered,
  isDragging,
}: BlockRingArgs): string {
  const sectionChildRing = elevatedSection
    ? cn(
        "rounded-sm ring-1 ring-offset-0 transition-[box-shadow] duration-150",
        selected || isDragging ? "ring-white/45" : hovered ? "ring-white/35" : "ring-transparent",
      )
    : cn(
        "rounded-sm ring-1 ring-offset-0 transition-[box-shadow] duration-150",
        selected || isDragging ? "ring-sky-500/70" : hovered ? "ring-border/55" : "ring-transparent",
      );

  if (seamless) {
    return cn(
      "transition-none",
      sectionChild
        ? sectionChildRing
        : selected
          ? elevatedSection
            ? "rounded-sm ring-1 ring-white/40 ring-offset-0"
            : "rounded-sm ring-1 ring-sky-500/70 ring-offset-0"
          : "rounded-sm",
      "!bg-transparent hover:!bg-transparent focus-within:!bg-transparent active:!bg-transparent",
      "dark:!bg-transparent dark:hover:!bg-transparent dark:focus-within:!bg-transparent dark:active:!bg-transparent",
    );
  }

  return cn(
    "transition-colors",
    selected
      ? "rounded-sm ring-1 ring-primary/45 ring-offset-2 ring-offset-transparent"
      : sectionChild
        ? sectionChildRing
        : "rounded-[2px] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]",
  );
}

/**
 * Resolves whether a click on a block row should select the block.
 * Clicks landing on nested editable content (columns cells, section-child rich text) never
 * select under `row-click`; under `content-modifier-click` they select only with Cmd/Ctrl.
 */
export function shouldSelectFromClick(
  target: HTMLElement,
  policy: BlockSelectionPolicy,
  modifierPressed: boolean,
): boolean {
  const onNestedContent = Boolean(
    target.closest("[data-proposal-columns-content]") ||
      target.closest("[data-proposal-section-child-content]"),
  );
  if (!onNestedContent) return true;
  return policy === "content-modifier-click" && modifierPressed;
}
