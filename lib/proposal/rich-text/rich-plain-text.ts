/**
 * Best-effort plain text from proposal TipTap HTML (headings, paragraphs, lists, etc.).
 * Used to keep legacy `text` / `title` / `label` fields in sync for search, tokens, and fallbacks.
 */
export function stripProposalRichHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/li>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<\/h[1-6]>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const DEFAULT_PLAIN_TEXT_MAX_LENGTH = 500;

export function proposalRichHtmlToPlainText(
  html: string,
  options?: { maxLength?: number },
): string {
  const text = stripProposalRichHtml(html);
  const limit = options?.maxLength ?? DEFAULT_PLAIN_TEXT_MAX_LENGTH;
  return limit > 0 ? text.slice(0, limit) : text;
}
