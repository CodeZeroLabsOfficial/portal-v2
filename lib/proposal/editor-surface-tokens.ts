import { cn } from "@/lib/utils";

/**
 * Remaps shadcn semantic tokens to light-surface OKLCH values (aligned with `:root` in
 * `app/globals.css`). Apply on bright section bands and root-level editor blocks so
 * `text-foreground` stays dark when the admin shell is in dark mode.
 */
export const PROPOSAL_CANVAS_SURFACE_LIGHT_CLASSES = cn(
  "[color-scheme:light]",
  "[--background:var(--color-white)]",
  "[--foreground:var(--base-800)]",
  "[--card:var(--color-white)]",
  "[--card-foreground:var(--base-800)]",
  "[--popover:var(--color-white)]",
  "[--popover-foreground:var(--base-800)]",
  "[--muted:var(--color-neutral-100)]",
  "[--muted-foreground:var(--color-neutral-500)]",
  "[--border:var(--base-200)]",
  "[--input:var(--base-300)]",
  "[--secondary:var(--base-300)]",
  "[--secondary-foreground:var(--base-800)]",
  "[--accent:var(--base-200)]",
  "[--accent-foreground:var(--base-800)]",
  "[--primary:var(--base-950)]",
  "[--primary-foreground:var(--color-white)]",
  "[--ring:var(--base-800)]",
);

/**
 * Dark editorial band tokens for image/video/heavy fills. Keeps tier cards white while
 * `text-foreground` / `text-muted-foreground` read on the section backdrop.
 */
export const PROPOSAL_CANVAS_SURFACE_DARK_CLASSES = cn(
  "[color-scheme:dark]",
  "[--foreground:var(--base-200)]",
  "[--card:var(--color-white)]",
  "[--card-foreground:var(--base-800)]",
  "[--popover:var(--base-950)]",
  "[--popover-foreground:var(--base-200)]",
  "[--muted:var(--base-900)]",
  "[--muted-foreground:var(--base-400)]",
  "[--border:var(--base-800)]",
  "[--input:var(--base-700)]",
  "[--secondary:var(--base-500)]",
  "[--secondary-foreground:var(--base-200)]",
  "[--accent:var(--base-900)]",
  "[--accent-foreground:var(--base-200)]",
  "[--primary:var(--base-50)]",
  "[--primary-foreground:var(--base-900)]",
  "[--ring:var(--base-200)]",
);

/** Accordion panel body — light island on dark section bands (editor + public). */
export const PROPOSAL_ACCORDION_LIGHT_SURFACE_CLASSES = cn(
  "bg-white text-zinc-900",
  PROPOSAL_CANVAS_SURFACE_LIGHT_CLASSES,
);

/**
 * Buyer-facing View Agreement modal — fixed light surface when the staff portal is in dark mode.
 * Remaps semantic tokens and neutralizes `dark:` utilities on shadcn primitives inside the dialog.
 */
export const AGREEMENT_MODAL_LIGHT_SURFACE_CLASSES = cn(
  "bg-white text-zinc-900",
  PROPOSAL_CANVAS_SURFACE_LIGHT_CLASSES,
  "[&_[data-slot=button][data-variant=outline]]:bg-white",
  "[&_[data-slot=button][data-variant=outline]]:dark:bg-white",
  "[&_[data-slot=button][data-variant=outline]]:dark:hover:bg-accent",
  "[&_[data-slot=button][data-variant=ghost]]:dark:hover:bg-accent",
  "[&_[data-slot=input]]:dark:bg-transparent",
  "[&_[data-slot=checkbox]]:dark:bg-transparent",
);

/** Portaled menus (e-signature dropdown) — same light tokens as the agreement modal shell. */
export const AGREEMENT_MODAL_POPOVER_LIGHT_SURFACE_CLASSES = cn(
  PROPOSAL_CANVAS_SURFACE_LIGHT_CLASSES,
  "bg-popover text-popover-foreground",
);

/**
 * Restores readable copy inside accordion bodies when the parent section uses
 * light-on-dark chrome (same pattern as tier cards on `bg-card`).
 */
export const PROPOSAL_SECTION_DARK_ACCORDION_LIGHT_SURFACE_OVERRIDES = cn(
  "[&_[data-proposal-accordion-light-surface]]:text-zinc-900",
  "[&_[data-proposal-accordion-light-surface]]:[--foreground:var(--base-800)]",
  "[&_[data-proposal-accordion-light-surface]]:[--muted-foreground:var(--color-neutral-500)]",
  "[&_[data-proposal-accordion-light-surface]]:[--border:var(--base-200)]",
  "[&_[data-proposal-accordion-light-surface]_.proposal-rich-text]:!text-foreground",
  "[&_[data-proposal-accordion-light-surface]_.proposal-rich-text_a]:!text-primary",
);

/** Class on the Edit blocks tab stack — root-level blocks without a section shell. */
export const PROPOSAL_CANVAS_ROOT_CLASS = "proposal-document-editor-canvas";

export type ProposalCanvasSurface = "light" | "dark";
