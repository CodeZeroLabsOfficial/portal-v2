/** Comma/semicolon-separated tags field → normalized list (max 20). */
export function parseCustomerTagsInput(raw: string): string[] {
  return raw
    .split(/[,;]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);
}

/** Stored tags → value for the tags text input. */
export function formatCustomerTagsInput(tags: string[]): string {
  return tags.join(", ");
}
