import type { HeaderBlock, ProposalBlock, SectionBlock } from "@/types/proposal";
import { getBlockDefinition } from "@/components/features/proposal/blocks/block-editor-registry";

/** Top-level section bands — same units the builder Outline lists with section headings. */
export function countOutlineSections(blocks: ProposalBlock[]): number {
  return blocks.filter((block) => block.type === "section").length;
}

function htmlToPlainText(fragment: string): string {
  return fragment
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function headerBlockPlainText(block: HeaderBlock): string {
  const fromHtml = block.html?.trim() ? htmlToPlainText(block.html) : "";
  if (fromHtml) return fromHtml;
  return (block.text ?? "").trim();
}

/** Outline label for a section band — editor-only; not shown on the public proposal. */
export function sectionOutlineLabel(block: SectionBlock, outlineIndex: number): string {
  const explicit = block.title?.trim();
  if (explicit) return explicit;

  if (block.layout === "single") {
    const child = block.children[0];
    if (child) {
      const childLabel = getBlockDefinition(child.type)?.label;
      if (childLabel) return childLabel;
    }
  }

  const firstHeader = block.children.find((c): c is HeaderBlock => c.type === "header");
  if (firstHeader) {
    const fromHeader = headerBlockPlainText(firstHeader);
    if (fromHeader) return fromHeader;
  }

  return `Section ${outlineIndex + 1}`;
}
