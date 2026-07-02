import { cn } from "@/lib/utils";

/**
 * Remaps shadcn semantic tokens to light-surface OKLCH values (aligned with `:root` in
 * `app/globals.css`). Apply on bright section bands and root-level editor blocks so
 * `text-foreground` stays dark when the admin shell is in dark mode.
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

/**
 * Dark editorial band tokens for image/video/heavy fills. Keeps tier cards white while
 * `text-foreground` / `text-muted-foreground` read on the section backdrop.
 */
export const PROPOSAL_DARK_EDITOR_SURFACE_CLASSES = cn(
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

/** Class on the Edit blocks tab stack — root-level blocks without a section shell. */
export const PROPOSAL_DOCUMENT_EDITOR_CANVAS_CLASS = "proposal-document-editor-canvas";
