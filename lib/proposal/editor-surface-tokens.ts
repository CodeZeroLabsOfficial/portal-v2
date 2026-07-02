import { cn } from "@/lib/utils";

/**
 * Remaps shadcn semantic tokens to light-surface OKLCH values (aligned with `:root` in
 * `app/globals.css`). Use on bright section bands and the block editor canvas so
 * `text-foreground` stays dark even when the admin shell is in dark mode.
 */
export const PROPOSAL_LIGHT_EDITOR_SURFACE_CLASSES = cn(
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

/** Class on the Edit blocks tab stack — root-level blocks without a section shell. */
export const PROPOSAL_DOCUMENT_EDITOR_CANVAS_CLASS = "proposal-document-editor-canvas";
