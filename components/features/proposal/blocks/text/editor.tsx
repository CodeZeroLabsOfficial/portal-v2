"use client";

import { ProposalRichText } from "@/components/features/proposal/rich-text/proposal-rich-text";
import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import { escapeHtml } from "@/lib/common/escape-html";
import type { TextBlock } from "@/types/proposal";

export interface TextBlockEditorProps extends BlockEditorProps<TextBlock> {
  placeholder?: string;
  showBubbleWhenBlockSelected?: boolean;
}

export function TextBlockEditor({
  block,
  onChange,
  placeholder,
  showBubbleWhenBlockSelected,
}: TextBlockEditorProps) {
  return (
    <ProposalRichText
      key={block.id}
      html={block.html ?? (block.body ? `<p>${escapeHtml(block.body)}</p>` : "<p></p>")}
      editorMinHeightPx={block.editorMinHeightPx}
      onEditorMinHeightPxChange={(next) => onChange({ ...block, editorMinHeightPx: next })}
      resizableHeight
      placeholder={placeholder}
      showBubbleWhenBlockSelected={showBubbleWhenBlockSelected}
      onChange={(html) => onChange({ ...block, html, body: undefined })}
    />
  );
}
