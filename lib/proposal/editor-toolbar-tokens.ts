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

export type ProposalSectionInCanvasControlShape = "square" | "circle";

const SECTION_IN_CANVAS_CONTROL_BASE =
  "flex h-7 w-7 shrink-0 items-center justify-center border border-transparent p-0 transition-[color,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2";

/** Ghost affordances on the section canvas: gutter `+`, drag, top insert, CTA edit FAB. */
export function proposalSectionInCanvasControlClasses(
  appearance: ProposalToolbarAppearance,
  shape: ProposalSectionInCanvasControlShape,
): string {
  const rounded = shape === "square" ? "rounded-md" : "rounded-full";

  if (appearance === "elevated") {
    return cn(
      SECTION_IN_CANVAS_CONTROL_BASE,
      rounded,
      "bg-transparent text-white/80",
      "hover:bg-white/10 hover:text-white",
      "focus-visible:ring-white/40",
      "data-[state=open]:bg-white/15 data-[state=open]:text-white",
    );
  }

  return cn(
    SECTION_IN_CANVAS_CONTROL_BASE,
    rounded,
    "bg-transparent text-muted-foreground",
    "hover:bg-muted hover:text-foreground",
    "focus-visible:ring-ring",
    "data-[state=open]:bg-accent data-[state=open]:text-foreground",
  );
}

export function proposalSectionGutterDragHandleClasses(appearance: ProposalToolbarAppearance): string {
  return cn(
    proposalSectionInCanvasControlClasses(appearance, "square"),
    "touch-none cursor-grab active:cursor-grabbing",
  );
}

export type ProposalEditorCanvasChipSize = "sm" | "md";

/** Opaque mini chip on the canvas (Yoopta-style) — column insert, CTA edit affordances. */
export function proposalEditorCanvasChipClasses(
  appearance: ProposalToolbarAppearance,
  options: { size: ProposalEditorCanvasChipSize; shape: "circle" },
): string {
  return cn(
    "inline-flex shrink-0 items-center justify-center border border-border/80 bg-background p-0 shadow-sm",
    // Fixed dark icon on a light chip — do not use text-muted-foreground; dark sections remap that to white.
    "text-zinc-600 transition-[color,background-color,box-shadow] duration-150 ease-out",
    options.size === "sm" ? "h-7 w-7" : "h-8 w-8",
    "rounded-full",
    "hover:bg-muted hover:text-zinc-900",
    "focus-visible:outline-none focus-visible:ring-2",
    appearance === "elevated"
      ? "focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
      : "focus-visible:ring-ring",
    "data-[state=open]:bg-muted data-[state=open]:text-zinc-900",
  );
}

/** Vertical divider between compact layout-control groups inside a block toolbar. */
export function proposalToolbarLayoutControlsGroupDividerClasses(
  appearance: ProposalToolbarAppearance,
): string {
  return appearance === "elevated" ? "border-white/10" : "border-border/60";
}

/** Dropdown/popover trigger inside a proposal toolbar shell. */
export function proposalToolbarBubbleTriggerClasses(appearance: ProposalToolbarAppearance): string {
  if (appearance === "elevated") {
    return cn(
      "inline-flex items-center gap-1.5 rounded px-2 py-1 text-sm transition-colors",
      proposalToolbarMenuItemClasses("elevated"),
      proposalToolbarMenuItemHoverClasses("elevated"),
    );
  }
  return "inline-flex items-center gap-1.5 rounded px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";
}

/** Compact label badge inside bubble triggers (e.g. H1 short label). */
export function proposalToolbarBubbleBadgeClasses(appearance: ProposalToolbarAppearance): string {
  if (appearance === "elevated") {
    return cn(
      "inline-flex h-5 w-7 items-center justify-center rounded bg-white/10 font-semibold tabular-nums",
      proposalToolbarMenuItemCompactClasses("elevated"),
    );
  }
  return "inline-flex h-5 w-7 items-center justify-center rounded bg-muted font-semibold tabular-nums text-muted-foreground";
}

export function proposalToolbarBubbleMutedFgClasses(appearance: ProposalToolbarAppearance): string {
  return appearance === "elevated"
    ? "text-[var(--proposal-toolbar-muted-fg)]"
    : "text-muted-foreground";
}

export function proposalToolbarBubbleActiveAccentClasses(appearance: ProposalToolbarAppearance): string {
  return appearance === "elevated" ? "text-sky-400" : "text-primary";
}

export function proposalToolbarBubbleMenuItemClasses(
  appearance: ProposalToolbarAppearance,
  active?: boolean,
): string {
  if (appearance === "elevated") {
    return cn(
      "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm outline-none",
      proposalToolbarMenuItemClasses("elevated"),
      proposalToolbarMenuItemHoverClasses("elevated"),
      "hover:text-white focus-visible:text-white",
      active && "bg-[var(--proposal-toolbar-active-bg)] text-white",
    );
  }
  return cn(
    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm outline-none",
    proposalToolbarMenuItemClasses("surface"),
    proposalToolbarMenuItemHoverClasses("surface"),
    active && "bg-accent text-foreground",
  );
}

export function proposalToolbarBubblePanelClasses(appearance: ProposalToolbarAppearance): string {
  return cn("rounded-md border p-1 shadow-lg", proposalToolbarPanelClasses(appearance));
}

export function proposalToolbarBubblePanelFloatingClasses(
  appearance: ProposalToolbarAppearance,
): string {
  return cn(proposalToolbarBubblePanelClasses(appearance), "absolute left-0 top-full z-[100] mt-1");
}

export function proposalToolbarBubbleSmallIconButtonClasses(
  appearance: ProposalToolbarAppearance,
  active?: boolean,
): string {
  if (appearance === "elevated") {
    return cn(
      "inline-flex h-7 w-7 items-center justify-center rounded transition-colors",
      proposalToolbarMenuItemClasses("elevated"),
      proposalToolbarMenuItemHoverClasses("elevated"),
      "hover:text-white focus-visible:text-white",
      active && "bg-[var(--proposal-toolbar-active-bg)] text-white",
    );
  }
  return cn(
    "inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
    active && "bg-muted text-foreground",
  );
}

export function proposalToolbarBubbleStepperButtonClasses(
  appearance: ProposalToolbarAppearance,
): string {
  return cn(
    "rounded p-0.5 transition-colors",
    proposalToolbarBubbleMutedFgClasses(appearance),
    appearance === "elevated"
      ? "hover:bg-[var(--proposal-toolbar-hover-bg)] hover:text-white"
      : "hover:bg-muted hover:text-foreground",
  );
}

export function proposalToolbarBubbleFieldShellClasses(appearance: ProposalToolbarAppearance): string {
  return appearance === "elevated"
    ? "flex h-8 items-center rounded border border-white/10 bg-white/5 pr-0.5"
    : "flex h-8 items-center rounded border border-border bg-muted/30 pr-0.5";
}

export function proposalToolbarBubbleInlineInputClasses(appearance: ProposalToolbarAppearance): string {
  return appearance === "elevated"
    ? "min-w-0 flex-1 bg-transparent px-2 text-sm tabular-nums text-[var(--proposal-toolbar-fg)] outline-none"
    : "min-w-0 flex-1 bg-transparent px-2 text-sm tabular-nums text-foreground outline-none";
}

export function proposalToolbarBubbleSelectClasses(appearance: ProposalToolbarAppearance): string {
  if (appearance === "elevated") {
    return "h-8 w-full rounded border border-white/10 bg-white/5 px-2 text-sm text-[var(--proposal-toolbar-fg)] outline-none focus:bg-white/10";
  }
  return "h-8 w-full rounded border border-border bg-muted/30 px-2 text-sm text-foreground outline-none focus:bg-muted";
}

/** Text trigger inside a block toolbar (e.g. Edit agreement, Edit columns). */
export function proposalToolbarAuxTextButtonClasses(
  appearance: ProposalToolbarAppearance,
  options?: { compact?: boolean },
): string {
  const size = options?.compact ? "gap-1 rounded-full px-2.5" : "gap-1.5 rounded-full px-3";
  if (appearance === "elevated") {
    return cn(
      "inline-flex h-8 items-center text-xs font-medium transition-colors shadow-none",
      size,
      proposalToolbarMenuItemClasses("elevated"),
      proposalToolbarMenuItemHoverClasses("elevated"),
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
    );
  }
  return cn(
    "inline-flex h-8 items-center text-xs font-medium transition-colors shadow-none",
    size,
    "bg-transparent text-muted-foreground hover:bg-background hover:text-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );
}
