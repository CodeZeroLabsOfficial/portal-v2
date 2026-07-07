import { proposalBlockRendersFlushEditorBand } from "@/lib/proposal/blocks";
import type { ProposalBlock } from "@/types/proposal";

/**
 * Where a block's floating toolbar mounts.
 * - `inside-band`: absolute, top-right inside a full-bleed section band (never above the canvas).
 * - `inline-row`: absolute, top-right overlaying the block's own content row.
 */
export type ToolbarPlacement = "inside-band" | "inline-row";

/**
 * When a block's toolbar is shown.
 * - `selected-only`: only while the block is selected.
 * - `hover-or-selected`: on row hover (with hover bridge) or while selected.
 */
export type ToolbarVisibility = "selected-only" | "hover-or-selected";

/**
 * How a block becomes selected.
 * - `row-click`: any click inside the row selects it (unless it lands on nested editable content).
 * - `content-modifier-click`: plain clicks edit nested content; Cmd/Ctrl+click selects the block.
 */
export type BlockSelectionPolicy = "row-click" | "content-modifier-click";

export interface BlockChromeConfig {
  toolbarPlacement: ToolbarPlacement;
  toolbarVisibility: ToolbarVisibility;
  selectionPolicy: BlockSelectionPolicy;
}

/**
 * Whether a root block renders a band container (section/agreement always do; splash always;
 * packages only with an active backdrop). Band-hosted blocks host their toolbar inside the band.
 */
function isBandHostedRootBlock(block: ProposalBlock): boolean {
  return (
    block.type === "section" ||
    block.type === "agreement" ||
    block.type === "splash" ||
    (block.type === "packages" && proposalBlockRendersFlushEditorBand(block))
  );
}

/** Chrome policy for a root-level block, keyed on whether it renders a band container. */
export function rootBlockChrome(block: ProposalBlock): BlockChromeConfig {
  if (isBandHostedRootBlock(block)) {
    return {
      toolbarPlacement: "inside-band",
      toolbarVisibility: "selected-only",
      selectionPolicy: "row-click",
    };
  }
  if (block.type === "image" || block.type === "icon") {
    return {
      toolbarPlacement: "inline-row",
      toolbarVisibility: "selected-only",
      selectionPolicy: "row-click",
    };
  }
  return {
    toolbarPlacement: "inline-row",
    toolbarVisibility: "hover-or-selected",
    selectionPolicy: "row-click",
  };
}

/** Chrome policy for a block nested inside a section or agreement stack. */
export function sectionChildChrome(block: ProposalBlock): BlockChromeConfig {
  if (block.type === "image" || block.type === "icon") {
    return {
      toolbarPlacement: "inline-row",
      toolbarVisibility: "selected-only",
      selectionPolicy: "content-modifier-click",
    };
  }
  return {
    toolbarPlacement: "inline-row",
    toolbarVisibility: "hover-or-selected",
    selectionPolicy: "content-modifier-click",
  };
}
