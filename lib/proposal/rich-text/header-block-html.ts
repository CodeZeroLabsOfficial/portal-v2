import { escapeHtml } from "@/lib/common/escape-html";
import type { HeaderBlock } from "@/types/proposal";

export function headerBlockEditorHtml(block: HeaderBlock): string {
  if (block.html?.trim()) return block.html;
  const t = (block.text ?? "").trim() || "Section heading";
  return `<h2>${escapeHtml(t)}</h2>`;
}
