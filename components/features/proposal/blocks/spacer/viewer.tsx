"use client";

import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";

export function renderSpacerBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "spacer") return null;
  const px =
    typeof block.heightPx === "number" && Number.isFinite(block.heightPx)
      ? Math.min(2400, Math.max(1, Math.round(block.heightPx)))
      : 40;
  return <div className="w-full shrink-0" style={{ height: px }} aria-hidden />;
}
