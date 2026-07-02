import type { CustomerNoteBodyFormat } from "@/types/customer";

/** Strip markup for search, activity excerpts, and empty checks. */
export function noteBodyPlainText(body: string, bodyFormat?: CustomerNoteBodyFormat): string {
  if (!bodyFormat || bodyFormat === "plain") {
    return body.trim();
  }
  return body
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function isNoteBodyEmpty(body: string, bodyFormat?: CustomerNoteBodyFormat): boolean {
  return noteBodyPlainText(body, bodyFormat).length === 0;
}
