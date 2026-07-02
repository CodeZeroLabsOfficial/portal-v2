import type { ProposalRecord } from "@/types/proposal";

/** Staff builder URL; preserves customer back-link when known. */
export function proposalEditHref(proposal: ProposalRecord, customerId?: string): string {
  const base = `/admin/proposals/${proposal.id}`;
  const cid = customerId?.trim() || proposal.customerId?.trim();
  if (cid) return `${base}?customer=${encodeURIComponent(cid)}`;
  return base;
}

/** Public share URL when published; null for drafts or missing token. */
export function proposalPublicUrl(proposal: ProposalRecord): string | null {
  const token = proposal.shareToken?.trim();
  if (!token || proposal.status === "draft") return null;
  return `/p/${token}`;
}

export function canSendProposal(proposal: ProposalRecord): boolean {
  return proposal.status === "draft";
}

export function canOpenPublicProposal(proposal: ProposalRecord): boolean {
  return Boolean(proposal.shareToken?.trim()) && proposal.status !== "draft";
}
