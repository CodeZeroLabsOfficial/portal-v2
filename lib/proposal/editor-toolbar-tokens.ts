import { cn } from "@/lib/utils";

import {
  PROPOSAL_TOOLBAR_ELEVATED_SCOPE_CLASSES,
  PROPOSAL_TOOLBAR_PANEL_ELEVATED_CLASSES,
  PROPOSAL_TOOLBAR_PANEL_SURFACE_CLASSES,
  PROPOSAL_TOOLBAR_SHELL_ELEVATED_CLASSES,
  PROPOSAL_TOOLBAR_SHELL_SURFACE_CLASSES,
} from "@/lib/proposal/editor-glass";

/** Kit-aligned toolbar typography and sizing for proposal builder chrome. */
export const PROPOSAL_TOOLBAR_TOKENS = {
  shared: {
    iconButton: "size-8 shrink-0",
    icon: "size-4",
    separator: "mx-1 h-7",
    tooltip: "text-xs",
    tooltipShortcut: "text-muted-foreground ml-1 text-xs",
    popoverTitle: "text-sm font-medium",
    fieldLabel: "text-sm font-medium leading-none",
  },
  surface: {
    menuItem: "text-sm",
    menuItemCompact: "text-sm leading-none",
    sectionLabel: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
    hint: "text-xs text-muted-foreground",
  },
  elevated: {
    menuItem: "text-sm text-[var(--proposal-toolbar-fg)]",
    menuItemCompact: "text-sm leading-none text-[var(--proposal-toolbar-fg)]",
    sectionLabel:
      "text-xs font-medium uppercase tracking-wide text-[var(--proposal-toolbar-muted-fg)]",
    hint: "text-xs text-[var(--proposal-toolbar-muted-fg)]",
  },
} as const;

export type ProposalToolbarAppearance = "surface" | "elevated";

function appearanceKey(appearance: ProposalToolbarAppearance): "surface" | "elevated" {
  return appearance;
}

export function proposalToolbarShellClasses(appearance: ProposalToolbarAppearance): string {
  return appearance === "elevated"
    ? cn(PROPOSAL_TOOLBAR_SHELL_ELEVATED_CLASSES, PROPOSAL_TOOLBAR_ELEVATED_SCOPE_CLASSES)
    : PROPOSAL_TOOLBAR_SHELL_SURFACE_CLASSES;
}

export function proposalToolbarPanelClasses(appearance: ProposalToolbarAppearance): string {
  return appearance === "elevated"
    ? cn(PROPOSAL_TOOLBAR_PANEL_ELEVATED_CLASSES, PROPOSAL_TOOLBAR_ELEVATED_SCOPE_CLASSES)
    : PROPOSAL_TOOLBAR_PANEL_SURFACE_CLASSES;
}

export function proposalToolbarSectionLabelClasses(appearance: ProposalToolbarAppearance): string {
  return PROPOSAL_TOOLBAR_TOKENS[appearanceKey(appearance)].sectionLabel;
}

export function proposalToolbarHintClasses(appearance: ProposalToolbarAppearance): string {
  return PROPOSAL_TOOLBAR_TOKENS[appearanceKey(appearance)].hint;
}

export function proposalToolbarMenuItemClasses(appearance: ProposalToolbarAppearance): string {
  return PROPOSAL_TOOLBAR_TOKENS[appearanceKey(appearance)].menuItem;
}

export function proposalToolbarMenuItemCompactClasses(appearance: ProposalToolbarAppearance): string {
  return PROPOSAL_TOOLBAR_TOKENS[appearanceKey(appearance)].menuItemCompact;
}

export function proposalToolbarMenuItemHoverClasses(appearance: ProposalToolbarAppearance): string {
  return appearance === "elevated"
    ? "hover:bg-[var(--proposal-toolbar-hover-bg)] focus-visible:bg-[var(--proposal-toolbar-hover-bg)]"
    : "hover:bg-accent focus-visible:bg-accent";
}

export function proposalToolbarDividerClasses(appearance: ProposalToolbarAppearance): string {
  return cn(
    PROPOSAL_TOOLBAR_TOKENS.shared.separator,
    appearance === "elevated" ? "bg-white/10" : "bg-border",
  );
}

export function proposalToolbarElevatedDividerClasses(): string {
  return proposalToolbarDividerClasses("elevated");
}

export function proposalToolbarIconButtonClasses(
  appearance: ProposalToolbarAppearance,
  active?: boolean,
): string {
  if (appearance === "elevated") {
    return cn(
      PROPOSAL_TOOLBAR_TOKENS.shared.iconButton,
      "text-[var(--proposal-toolbar-fg)] hover:bg-[var(--proposal-toolbar-hover-bg)] focus-visible:ring-white/40",
      active && "bg-[var(--proposal-toolbar-active-bg)]",
    );
  }
  return cn(
    PROPOSAL_TOOLBAR_TOKENS.shared.iconButton,
    "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring",
    active && "bg-muted text-foreground",
  );
}

const SECTION_GUTTER_BUTTON_BASE =
  "flex h-7 w-7 shrink-0 items-center justify-center p-0 shadow-sm transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-100 focus-visible:outline-none focus-visible:ring-2 hover:scale-105";

/** Section-child gutter `+` / drag controls — matches toolbar appearance on the band. */
export function proposalSectionGutterButtonClasses(appearance: ProposalToolbarAppearance): string {
  if (appearance === "elevated") {
    return cn(
      SECTION_GUTTER_BUTTON_BASE,
      "rounded-md border border-white/25 bg-white/10 text-zinc-100",
      "hover:border-white/40 hover:bg-white/15 hover:text-white",
      "focus-visible:ring-white/35",
      "data-[state=open]:border-white/50 data-[state=open]:bg-white/20 data-[state=open]:text-white",
    );
  }
  return cn(
    SECTION_GUTTER_BUTTON_BASE,
    "rounded-md border border-border/80 bg-background text-muted-foreground",
    "hover:border-primary/50 hover:bg-background hover:text-primary",
    "focus-visible:ring-ring",
    "data-[state=open]:border-primary data-[state=open]:bg-primary data-[state=open]:text-primary-foreground",
  );
}

export function proposalSectionGutterDragHandleClasses(appearance: ProposalToolbarAppearance): string {
  return cn(proposalSectionGutterButtonClasses(appearance), "touch-none cursor-grab active:cursor-grabbing");
}

/** Small FAB edit affordance on in-canvas previews (e.g. Accept CTA). */
export function proposalSectionFabEditButtonClasses(appearance: ProposalToolbarAppearance): string {
  if (appearance === "elevated") {
    return cn(
      "inline-flex h-7 w-7 items-center justify-center rounded-full border shadow-md transition-colors",
      "border-white/30 bg-white/15 text-white",
      "hover:border-white/45 hover:bg-white/25 hover:text-white",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
    );
  }
  return cn(
    "inline-flex h-7 w-7 items-center justify-center rounded-full border shadow-md transition-colors",
    "border-border bg-background text-muted-foreground",
    "hover:bg-muted hover:text-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );
}

/** Compact text trigger inside an elevated block toolbar (e.g. Edit agreement). */
export function proposalToolbarAuxTextButtonClasses(appearance: ProposalToolbarAppearance): string {
  if (appearance === "elevated") {
    return cn(
      "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors shadow-none",
      proposalToolbarMenuItemClasses("elevated"),
      proposalToolbarMenuItemHoverClasses("elevated"),
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
    );
  }
  return cn(
    "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors shadow-none",
    "bg-transparent text-muted-foreground hover:bg-background hover:text-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );
}

/** Circular icon trigger beside an elevated block toolbar (e.g. e-sign settings). */
export function proposalToolbarAuxIconButtonClasses(appearance: ProposalToolbarAppearance): string {
  if (appearance === "elevated") {
    return cn(
      "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors shadow-none",
      "bg-transparent text-[var(--proposal-toolbar-fg)] ring-1 ring-white/20",
      "hover:bg-[var(--proposal-toolbar-hover-bg)] hover:text-white",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900",
    );
  }
  return cn(
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors shadow-none",
    "bg-transparent text-muted-foreground ring-1 ring-border/70",
    "hover:bg-background hover:text-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  );
}
