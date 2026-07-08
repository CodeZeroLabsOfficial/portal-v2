"use client";

import type { ProposalBlock } from "@/types/proposal";
import {
  getBlockViewRenderer,
  PROPOSAL_BLOCK_DEFINITIONS,
  renderProposalBlockFromRegistry,
} from "@/components/features/proposal/blocks/block-editor-registry";
import type {
  ProposalBlockViewProps,
  ProposalBlockViewRenderer,
  ProposalRenderContext,
} from "@/lib/proposal/block-view-types";

export type { ProposalBlockViewProps, ProposalBlockViewRenderer, ProposalRenderContext };

export { renderProposalBlockFromRegistry, getBlockViewRenderer };

/** @deprecated Use {@link getBlockViewRenderer} or block-editor-registry `viewRenderer` fields. */
export const PROPOSAL_BLOCK_VIEW_REGISTRY: Partial<Record<ProposalBlock["type"], ProposalBlockViewRenderer>> =
  Object.fromEntries(
    PROPOSAL_BLOCK_DEFINITIONS.filter((def) => def.viewRenderer).map((def) => [def.type, def.viewRenderer!]),
  );
