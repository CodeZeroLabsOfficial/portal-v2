/**
 * Public proposal pages — vertical shell spacing + a centered reading column utility.
 * Proposal document chrome applies `PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES` to the optional logo,
 * non-section roots, gates, and footers; grouped `section` blocks span `w-full` edge-to-edge.
 */

import { cn } from "@/lib/utils";

/** Shared horizontal track for public proposal chrome (matches site header / preview bars). */
export const PROPOSAL_PUBLIC_PAGE_COLUMN_CLASSES = "mx-auto w-full max-w-6xl px-4 sm:px-6";

/** Typography / imagery column (logo, stray root blocks, footers). */
export const PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES = PROPOSAL_PUBLIC_PAGE_COLUMN_CLASSES;

/** Full-page root behind password gate and public document body. */
export const PROPOSAL_PUBLIC_PAGE_ROOT_CLASSES = "relative min-h-dvh bg-background";

/**
 * Fixed staff preview bar — proposal template public preview and contract agreement preview.
 * Pair with {@link PROPOSAL_PUBLIC_PREVIEW_MAIN_OFFSET_CLASSES} on `<main>`.
 */
export const PROPOSAL_PUBLIC_PREVIEW_BAR_CLASSES =
  "border-border/80 bg-background/85 supports-[backdrop-filter]:bg-background/70 fixed inset-x-0 top-0 z-50 border-b py-3 shadow-sm backdrop-blur-md";

/** Top padding when content scrolls under {@link PROPOSAL_PUBLIC_PREVIEW_BAR_CLASSES}. */
export const PROPOSAL_PUBLIC_PREVIEW_MAIN_OFFSET_CLASSES = "pt-16";

/** Branding logo row above the first document block. */
export const PROPOSAL_PUBLIC_LOGO_BAND_CLASSES =
  "flex justify-center px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6";

export const PROPOSAL_PUBLIC_LOGO_IMAGE_CLASSES = "h-10 max-w-[220px] object-contain sm:h-11";

/** Footer acceptance card sits below the document in the inner column. */
export const PROPOSAL_PUBLIC_FOOTER_SECTION_CLASSES = "mt-10 sm:mt-12 print:hidden";

/** Password gate vertical centering inside the locked shell. */
export const PROPOSAL_PUBLIC_GATE_WRAPPER_CLASSES =
  "flex min-h-[calc(100dvh-6rem)] flex-col items-center justify-center py-8";

/**
 * Proposal *editor* block content column — mirrors {@link PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES}
 * (centered `max-w-6xl` reading column) so the builder is WYSIWYG with the published view. Section
 * and splash backgrounds bleed full-width in their own layers; only their content sits in this column.
 */
export const PROPOSAL_EDITOR_BLOCK_CANVAS_INNER_CLASSES =
  "mx-auto w-full min-w-0 max-w-6xl px-4 sm:px-6";

/** Vertical inset at the top of a section band’s content column (editor + public). */
export const PROPOSAL_EDITOR_SECTION_INNER_PAD_TOP_CLASSES = "pt-8 sm:pt-10 md:pt-12";

/** Vertical inset at the bottom of a section band’s content column (editor + public). */
export const PROPOSAL_EDITOR_SECTION_INNER_PAD_BOTTOM_CLASSES = "pb-8 sm:pb-10 md:pb-12";

/** Both edges — use only when the wrapper has no insert rows as siblings. */
export const PROPOSAL_EDITOR_SECTION_INNER_PAD_CLASSES =
  `${PROPOSAL_EDITOR_SECTION_INNER_PAD_TOP_CLASSES} ${PROPOSAL_EDITOR_SECTION_INNER_PAD_BOTTOM_CLASSES}`;

/**
 * Negative margin on insert seams so the hover row overlaps adjacent flush bands (Qwilr-style).
 * Pair with `h-0` insert host + `h-7` absolute hit target.
 */
export const PROPOSAL_EDITOR_INSERT_ROW_OVERLAP_CLASSES = "-my-3.5";

export const PROPOSAL_PUBLIC_SHELL_CLASSES =
  "proposal-print-root w-full py-12 sm:py-14 print:py-8";

/** Narrow column wrapper for password gate & footers beside the unconstrained proposal body */
export const PROPOSAL_PUBLIC_CONTENT_CLASSES =
  `${PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES} print:max-w-none`;

/** Proposal body fills the horizontal track of `<main>`; do not nest inside `PROPOSAL_PUBLIC_CONTENT_CLASSES`. */
export const PROPOSAL_PUBLIC_DOCUMENT_OUTER_CLASSES = "w-full print:max-w-none";

/**
 * Break a block out of `PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES` to the viewport width — same horizontal band as
 * `ProposalSectionShell` with `viewportBleed` (section backgrounds).
 */
export const PROPOSAL_PUBLIC_VIEWPORT_BREAKOUT_CLASSES =
  "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 print:w-full print:max-w-none print:translate-x-0 print:left-0";

/**
 * Padding inside a section’s inner column (above/below the stacked children — sole vertical “band” inset).
 * Matches editor section rhythm; siblings inside the section are not spaced with margins.
 */
export const PROPOSAL_DOCUMENT_BLOCK_INNER_PAD_CLASSES = PROPOSAL_EDITOR_SECTION_INNER_PAD_CLASSES;

/**
 * Root stack wrapper in `ProposalDocumentView`: bottom padding only when the last block is not a flush band.
 */
export const PROPOSAL_DOCUMENT_ROOT_STACK_GAP_CLASSES = "flex flex-col gap-0 pb-8 sm:pb-10 md:pb-12";

/** Row gap when the two-column layout stacks on narrow viewports — keep flush; section padding carries vertical rhythm. */
export const PROPOSAL_DOCUMENT_COLUMNS_ROW_GAP_CLASSES = "gap-y-0";

export interface ProposalPublicMainClassesOptions {
  /** Last block is a full-bleed band — trim bottom page padding. */
  flushBottom?: boolean;
  /** Password gate — centered column with vertical shell padding. */
  locked?: boolean;
}

/** `<main>` classes for `/p/[token]` and staff public preview routes. */
export function proposalPublicMainClasses({
  flushBottom = false,
  locked = false,
}: ProposalPublicMainClassesOptions = {}): string {
  if (locked) {
    return cn(PROPOSAL_PUBLIC_SHELL_CLASSES, "min-h-dvh");
  }
  if (flushBottom) {
    return "proposal-print-root w-full min-h-dvh pb-0 pt-0 print:pb-0";
  }
  return "proposal-print-root w-full min-h-dvh pb-12 pt-0 print:pb-8 sm:pb-14";
}

/**
 * Top inset on the first child only. Bottom inset lives on the section stack *after* the
 * trailing insert row so “add below” sits directly under the last block (e.g. a spacer).
 */
export function proposalEditorSectionChildEdgePadClasses(index: number, childCount: number): string {
  if (childCount <= 0 || index !== 0) return "";
  return PROPOSAL_EDITOR_SECTION_INNER_PAD_TOP_CLASSES;
}

/** Bottom band inset on the section child stack (below trailing insert). */
export const PROPOSAL_EDITOR_SECTION_STACK_BOTTOM_PAD_CLASSES =
  PROPOSAL_EDITOR_SECTION_INNER_PAD_BOTTOM_CLASSES;

/**
 * Zero-height insert seam inside a section stack — pair with an absolutely positioned trigger
 * so hover chrome floats without shifting siblings. No negative margin here: section stacks use
 * {@link PROPOSAL_EDITOR_SECTION_STACK_GAP_CLASSES} so each child (e.g. stacked columns rows) keeps
 * its own hit target and toolbar slot.
 */
export const PROPOSAL_EDITOR_SECTION_CHILD_INSERT_HOST_CLASSES =
  "relative h-0 w-full overflow-visible";

/** Vertical rhythm between blocks inside a section band (editor) — tight but non-overlapping. */
export const PROPOSAL_EDITOR_SECTION_STACK_GAP_CLASSES = "gap-y-3 sm:gap-y-3.5";
