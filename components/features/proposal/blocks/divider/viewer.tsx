"use client";

import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";

export function renderDividerBlock(_props: ProposalBlockViewProps): React.ReactNode {
  return <hr className="border-border/80" />;
}
