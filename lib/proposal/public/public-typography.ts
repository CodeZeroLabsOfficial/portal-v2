/**
 * Kit-aligned typography tokens for public proposal chrome (page shell, gate, footer).
 * Commerce block internals keep their own density tokens until a dedicated pass.
 */

/** Table column headers, term toggles, and meta labels on the public page. */
export const PROPOSAL_PUBLIC_META_LABEL_CLASSES =
  "text-xs font-medium uppercase tracking-wide text-muted-foreground";

/** Agreement accept form + disclaimer ink (legacy proposal accent). */
export const AGREEMENT_MODAL_INK_TEXT_CLASSES = "text-[#1a1a5e]";

/** Accept form intro line under the “Accept” heading. */
export const AGREEMENT_MODAL_ACCEPT_DESCRIPTION_CLASSES =
  "mt-2 text-center text-sm leading-relaxed text-zinc-500";

/** Card and panel titles in password gate / acceptance footer. */
export const PROPOSAL_PUBLIC_PANEL_TITLE_CLASSES = "text-base font-semibold tracking-tight";

/** Supporting copy under panel titles. */
export const PROPOSAL_PUBLIC_PANEL_DESCRIPTION_CLASSES = "text-sm text-muted-foreground";
