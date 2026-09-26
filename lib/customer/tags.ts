/** Stored tag length matches `updateCustomerFormSchema`. */
export const MAX_CUSTOMER_TAG_LENGTH = 48;

/** Stored tag count matches `updateCustomerFormSchema`. */
export const MAX_CUSTOMER_TAGS = 20;

export interface CustomerTagOption {
  label: string;
  /** Suggestion swatch. */
  color: string;
}

/** Catalog shown in the customer tags picker. Custom tags are still allowed. */
export const CUSTOMER_TAG_OPTIONS: readonly CustomerTagOption[] = [
  { label: "VIP", color: "bg-pink-500" },
  { label: "Priority", color: "bg-purple-500" },
  { label: "Partner", color: "bg-green-500" },
  { label: "Referral", color: "bg-cyan-500" },
  { label: "Corporate", color: "bg-teal-500" },
  { label: "Prospect", color: "bg-orange-500" }
];

export function customerTagKey(tag: string): string {
  return tag.trim().toLowerCase();
}

/** Trim, collapse spaces, and use the catalog label when it matches. */
export function normalizeCustomerTag(raw: string): string | null {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  const catalog = CUSTOMER_TAG_OPTIONS.find(
    (option) => customerTagKey(option.label) === customerTagKey(trimmed)
  );
  const label = catalog?.label ?? trimmed;
  if (label.length > MAX_CUSTOMER_TAG_LENGTH) return null;
  return label;
}

/** Drops blanks and case-insensitive duplicates, preserving first-seen order. */
export function dedupeCustomerTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tag of tags) {
    const normalized = normalizeCustomerTag(tag);
    if (!normalized) continue;
    const key = customerTagKey(normalized);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
    if (result.length >= MAX_CUSTOMER_TAGS) break;
  }
  return result;
}
