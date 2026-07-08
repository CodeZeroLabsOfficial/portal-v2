"use client";

import { ProposalRichTextHtml } from "@/components/shared/proposal-rich-text-html";
import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";

export function renderTextBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "text") return null;
  const tb = block;
  const editorMinStyle =
    tb.editorMinHeightPx != null && Number.isFinite(tb.editorMinHeightPx)
      ? {
          minHeight: `${Math.min(2000, Math.max(48, Math.round(tb.editorMinHeightPx)))}px`,
        }
      : undefined;
  if (block.html?.trim()) {
    return (
      <ProposalRichTextHtml html={block.html} layout="body" style={editorMinStyle} />
    );
  }
  return (
    <div style={editorMinStyle} className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
      {block.body ?? ""}
    </div>
  );
}
