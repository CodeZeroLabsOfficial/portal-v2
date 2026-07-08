"use client";

import { ProposalRichText } from "@/components/features/proposal/rich-text/proposal-rich-text";
import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import { headerBlockEditorHtml } from "@/lib/proposal/rich-text/header-block-html";
import { proposalRichHtmlToPlainText } from "@/lib/proposal/rich-text/rich-plain-text";
import type { HeaderBlock } from "@/types/proposal";

export interface HeaderBlockEditorProps extends BlockEditorProps<HeaderBlock> {
  showBubbleWhenBlockSelected?: boolean;
  formattingChrome?: "bubble" | "band";
}

export function HeaderBlockEditor({
  block,
  onChange,
  canvas,
  showBubbleWhenBlockSelected,
  formattingChrome,
}: HeaderBlockEditorProps) {
  const resolvedFormattingChrome = formattingChrome ?? canvas?.formattingChrome ?? "bubble";
  const resolvedShowBubble =
    showBubbleWhenBlockSelected ??
    (resolvedFormattingChrome !== "band" && canvas?.selectedBlockId === block.id);

  return (
    <ProposalRichText
      key={block.id}
      variant="header"
      html={headerBlockEditorHtml(block)}
      placeholder="Heading"
      showBubbleWhenBlockSelected={resolvedShowBubble}
      formattingChrome={resolvedFormattingChrome}
      onChange={(html) =>
        onChange({
          ...block,
          html,
          text: proposalRichHtmlToPlainText(html) || block.text,
        })
      }
    />
  );
}
