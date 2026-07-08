import { proposalBlockRendersFlushEditorBand } from "@/lib/proposal/blocks";
import type { ProposalBlock } from "@/types/proposal";

/**
 * Where a block's floating toolbar mounts:
 * - `inside-band` — absolutely positioned in the band's top-end corner (flush backdrop bands).
 * - `inline-row` — absolutely positioned at the top-end of the block row.
 * There is no above-the-block (`-translate-y-full`) placement.
 */
export type BlockToolbarPlacement = "inside-band" | "inline-row";

export type BlockToolbarVisibility = "selected-only" | "hover-or-selected";

export interface BlockChromeConfig {
  toolbarPlacement: BlockToolbarPlacement;
  toolbarVisibility: BlockToolbarVisibility;
}

/** Media blocks keep their toolbar tucked away until explicitly selected. */
function mediaSelectedOnly(type: ProposalBlock["type"]): boolean {
  return type === "image" || type === "icon";
}

/** Chrome for a top-level (root canvas) block. */
export function rootBlockChrome(block: ProposalBlock): BlockChromeConfig {
  if (proposalBlockRendersFlushEditorBand(block)) {
    return { toolbarPlacement: "inside-band", toolbarVisibility: "selected-only" };
  }
  return {
    toolbarPlacement: "inline-row",
    toolbarVisibility: mediaSelectedOnly(block.type) ? "selected-only" : "hover-or-selected",
  };
}

/** Chrome for a block nested inside a section/agreement band. */
export function sectionChildChrome(block: ProposalBlock): BlockChromeConfig {
  return {
    toolbarPlacement: "inline-row",
    toolbarVisibility: mediaSelectedOnly(block.type) ? "selected-only" : "hover-or-selected",
  };
}
