"use client";

import { ProposalRichText } from "@/components/features/proposal/rich-text/proposal-rich-text";
import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import { escapeHtml } from "@/lib/common/escape-html";
import type { TextBlock } from "@/types/proposal";

export interface TextBlockEditorProps extends BlockEditorProps<TextBlock> {
  placeholder?: string;
  showBubbleWhenBlockSelected?: boolean;
  formattingChrome?: "bubble" | "band";
}

export function TextBlockEditor({
  block,
  onChange,
  canvas,
  placeholder,
  showBubbleWhenBlockSelected,
  formattingChrome,
}: TextBlockEditorProps) {
  const resolvedFormattingChrome = formattingChrome ?? canvas?.formattingChrome ?? "bubble";
  const resolvedShowBubble =
    showBubbleWhenBlockSelected ??
    (resolvedFormattingChrome !== "band" && canvas?.selectedBlockId === block.id);

  return (
    <ProposalRichText
      key={block.id}
      html={block.html ?? (block.body ? `<p>${escapeHtml(block.body)}</p>` : "<p></p>")}
      editorMinHeightPx={block.editorMinHeightPx}
      onEditorMinHeightPxChange={(next) => onChange({ ...block, editorMinHeightPx: next })}
      resizableHeight
      placeholder={placeholder ?? canvas?.textPlaceholder}
      showBubbleWhenBlockSelected={resolvedShowBubble}
      formattingChrome={resolvedFormattingChrome}
      onChange={(html) => onChange({ ...block, html, body: undefined })}
    />
  );
}
