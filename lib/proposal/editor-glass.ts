import { cn } from "@/lib/utils";

/**
 * Frosted-glass chrome for floating bubble toolbars in the proposal / contract builder.
 */

/** Light pill toolbars on blocks (move, duplicate, image controls, etc.). */
export const PROPOSAL_TOOLBAR_SHELL_SURFACE_CLASSES =
  "border-border/80 bg-background/85 text-foreground shadow-sm ring-1 ring-black/[0.04] backdrop-blur-md supports-[backdrop-filter]:bg-background/70 dark:ring-white/10";

/** Rich-text selection bubble (dark bar over varied section backgrounds). */
export const PROPOSAL_TOOLBAR_SHELL_ELEVATED_CLASSES =
  "border-zinc-700/50 bg-zinc-900/80 text-zinc-100 shadow-xl ring-1 ring-white/[0.06] backdrop-blur-md supports-[backdrop-filter]:bg-zinc-900/65";

/** Compact panels attached to a toolbar (e.g. Plans background picker). */
export const PROPOSAL_TOOLBAR_PANEL_SURFACE_CLASSES =
  "border-border/80 bg-background/85 shadow-sm ring-1 ring-black/[0.04] backdrop-blur-md supports-[backdrop-filter]:bg-background/70 dark:ring-white/10";

/** Elevated dropdown / merge-token panels (dark chrome). */
export const PROPOSAL_TOOLBAR_PANEL_ELEVATED_CLASSES =
  "border-zinc-700/50 bg-zinc-900/80 text-zinc-100 shadow-lg ring-1 ring-white/[0.06] backdrop-blur-md supports-[backdrop-filter]:bg-zinc-900/65";

/**
 * Scoped semantic tokens for elevated (dark) toolbars — mirrors kit tiptap.css intent without
 * scattering raw zinc utilities across block chrome.
 */
export const PROPOSAL_TOOLBAR_ELEVATED_SCOPE_CLASSES = cn(
  "[--proposal-toolbar-fg:var(--base-200)]",
  "[--proposal-toolbar-muted-fg:var(--base-400)]",
  "[--proposal-toolbar-border:var(--base-700)]",
  "[--proposal-toolbar-hover-bg:rgb(255_255_255/0.1)]",
  "[--proposal-toolbar-active-bg:rgb(255_255_255/0.15)]",
);
