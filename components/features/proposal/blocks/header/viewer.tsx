"use client";

import { ProposalRichTextHtml } from "@/components/shared/proposal-rich-text-html";
import { headerBlockEditorHtml } from "@/lib/proposal/rich-text/header-block-html";
import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";

export function renderHeaderBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "header") return null;
  return <ProposalRichTextHtml html={headerBlockEditorHtml(block)} layout="heading" />;
}
