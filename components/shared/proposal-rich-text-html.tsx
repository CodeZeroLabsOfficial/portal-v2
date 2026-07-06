"use client";

import * as React from "react";

import {
  proposalRichTextDisplayClasses,
  type ProposalRichTextDisplayOptions,
} from "@/lib/proposal/rich-text/display-typography";
import { sanitizeProposalHtml } from "@/lib/proposal/sanitize";
import { cn } from "@/lib/utils";

export interface ProposalRichTextHtmlProps extends ProposalRichTextDisplayOptions {
  html: string;
  className?: string;
  style?: React.CSSProperties;
}

/** Sanitized rich HTML with unified proposal display typography. */
export function ProposalRichTextHtml({
  html,
  tone,
  layout,
  className,
  style,
}: ProposalRichTextHtmlProps) {
  const safe = React.useMemo(() => sanitizeProposalHtml(html), [html]);
  if (!safe.trim()) return null;

  return (
    <div
      data-proposal-rich-content=""
      className={cn(proposalRichTextDisplayClasses({ tone, layout }), className)}
      style={style}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
