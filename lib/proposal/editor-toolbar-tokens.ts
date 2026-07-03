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
