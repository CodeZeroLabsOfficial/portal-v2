"use client";

import { PricingBlockPublic } from "@/components/features/proposal/blocks/pricing/public";
import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";

export function renderPricingBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "pricing") return null;
  return <PricingBlockPublic block={block} />;
}
