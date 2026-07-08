"use client";

import type { IconBlock } from "@/types/proposal";
import { ProposalIconBlockDisplay } from "@/components/features/proposal/blocks/icon/display";
import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";

export function renderIconBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "icon") return null;
  return <ProposalIconBlockDisplay block={block as IconBlock} />;
}
