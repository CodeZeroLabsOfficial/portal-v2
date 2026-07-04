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

/** Rich agreement / legal HTML inside agreement modals (light-scoped shell). */
export const AGREEMENT_MODAL_RICH_TEXT_CLASSES =
  "proposal-rich-text max-w-none text-[15px] leading-relaxed text-muted-foreground [&_h1]:mt-10 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-foreground [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-foreground [&_a]:underline [&_.proposal-agreement-spacer]:m-0 [&_.proposal-agreement-spacer]:block [&_.proposal-agreement-spacer]:shrink-0 [&_.proposal-agreement-spacer]:overflow-hidden [&_.proposal-agreement-spacer]:p-0";
