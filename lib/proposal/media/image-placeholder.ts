/** Matches `createBlock("image")` placeholder so new blocks are hidden on the public viewer. */
export const PROPOSAL_IMAGE_BLOCK_PLACEHOLDER_URL = "https://";

export function isProposalImagePlaceholderUrl(url: string): boolean {
  const t = url.trim();
  return t === "" || t === PROPOSAL_IMAGE_BLOCK_PLACEHOLDER_URL || t === "http://";
}
