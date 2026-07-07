const FIRST_SECTION_RE = /^(\s*<section\b[\s\S]*?<\/section>)([\s\S]*)$/i;
const HEADING_BLOCK_RE = /<h([1-6])(\s[^>]*)?>[\s\S]*?<\/h\1>/gi;

/**
 * Splits custom legal HTML into the first printable block and the remainder.
 * Prefers the first `<section>`; otherwise splits before the second heading.
 */
export function splitAgreementLegalHtml(html: string): {
  firstBlockHtml: string;
  remainderHtml: string;
} {
  const trimmed = html.trim();
  if (!trimmed) {
    return { firstBlockHtml: "", remainderHtml: "" };
  }

  const sectionMatch = FIRST_SECTION_RE.exec(trimmed);
  if (sectionMatch) {
    return {
      firstBlockHtml: sectionMatch[1].trim(),
      remainderHtml: sectionMatch[2].trim(),
    };
  }

  const headings: RegExpExecArray[] = [];
  const re = new RegExp(HEADING_BLOCK_RE.source, "gi");
  let match: RegExpExecArray | null;
  while ((match = re.exec(trimmed)) !== null) {
    headings.push(match);
  }

  if (headings.length >= 2) {
    const secondStart = headings[1].index ?? trimmed.length;
    return {
      firstBlockHtml: trimmed.slice(0, secondStart).trim(),
      remainderHtml: trimmed.slice(secondStart).trim(),
    };
  }

  return { firstBlockHtml: trimmed, remainderHtml: "" };
}

/** True when legal HTML uses `<section>` bands (page-break handled via print CSS). */
export function agreementLegalHtmlUsesSectionTags(html: string): boolean {
  return /<section\b/i.test(html);
}
