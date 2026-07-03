import { iterateProposalContentBlocks } from "@/lib/proposal/blocks";
import type { ProposalBlock, ProposalRecord } from "@/types/proposal";

const PRICING_MINOR_KEYS = [
  "totalMinorUnits",
  "amountMinorUnits",
  "subtotalMinorUnits",
  "totalCents",
  "amountCents",
  "amount",
] as const;

function extractPricingMinorFromBlock(block: ProposalBlock): number {
  if (block.type === "packages") {
    let maxVal = 0;
    for (const tier of block.tiers) {
      const v12 = tier.monthlyCost12Minor * 12 + (tier.upfrontCost12Minor ?? 0);
      const v24 = tier.monthlyCost24Minor * 24;
      maxVal = Math.max(maxVal, v12, v24);
    }
    return maxVal > 0 ? Math.round(maxVal) : 0;
  }
  if (block.type !== "pricing") {
    return 0;
  }
  if (block.lineItems.length > 0) {
    let sum = 0;
    for (const li of block.lineItems) {
      const unit = typeof li.unitAmountMinor === "number" ? li.unitAmountMinor : 0;
      const qty = typeof li.quantity === "number" && li.quantity > 0 ? li.quantity : 1;
      sum += Math.round(unit * qty);
    }
    if (sum > 0) return sum;
  }
  const record = block as unknown as Record<string, unknown>;
  for (const key of PRICING_MINOR_KEYS) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.round(value);
    }
  }
  return 0;
}

export function isPendingProposalStatus(status: ProposalRecord["status"]): boolean {
  return status === "draft" || status === "published" || status === "viewed";
}

export function countPendingProposals(proposals: ProposalRecord[]): number {
  return proposals.filter((p) => isPendingProposalStatus(p.status)).length;
}

export function sumPendingProposalValueMinor(proposals: ProposalRecord[]): number {
  return proposals
    .filter((p) => isPendingProposalStatus(p.status))
    .reduce(
      (sum, proposal) =>
        sum +
        [...iterateProposalContentBlocks(proposal.document.blocks)].reduce(
          (blockSum, block) => blockSum + extractPricingMinorFromBlock(block),
          0,
        ),
      0,
    );
}
