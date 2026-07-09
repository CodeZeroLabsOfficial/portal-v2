import type { CatalogServicePickerOption } from "@/types/catalog-service";
import type { PackagesBlock, PackagesPublicSelection, ProposalBlock, ProposalRecord } from "@/types/proposal";
import { effectiveCatalogAddonUnitAmount } from "@/lib/catalog/service-tier";
import { resolveProposalAddonBillingKind } from "@/lib/proposal/commerce/addon-billing";
import { effectivePricingLineQuantity } from "@/lib/proposal/commerce/pricing-line-quantity";
import {
  packageMonthlyTotalMinor,
  packageOneOffAddonsTotalMinor,
  packageTierUpfrontMinor,
  packagesAddonsSectionActive,
  packagesSelectionTermLabel,
} from "@/lib/proposal/commerce/packages-totals";
import { iterateProposalContentBlocks } from "@/lib/proposal/blocks";

/** Buyer agreement modal + staff CRM summary cards share this shape. */
export interface PackageSelectionSummary {
  blockId: string;
  blockTitle: string;
  currency: string;
  tierName: string;
  termLabel: string;
  monthlyMinor: number;
  monthlyTotalMinor: number;
  upfrontMinor: number;
  oneOffAddonsMinor: number;
  addonLines: Array<{
    id: string;
    label: string;
    quantity: number;
    unitAmountMinor: number;
    lineTotalMinor: number;
    billingKind: "recurring" | "one_off";
  }>;
  stripePriceId?: string;
}

export function packagesBlocksFromDocument(blocks: ProposalBlock[]): PackagesBlock[] {
  const out: PackagesBlock[] = [];
  for (const b of iterateProposalContentBlocks(blocks)) {
    if (b.type === "packages") out.push(b);
  }
  return out;
}

export function buildPackageSelectionSummary(
  block: PackagesBlock,
  selection: PackagesPublicSelection,
  catalogServices: readonly CatalogServicePickerOption[] = [],
): PackageSelectionSummary | null {
  const tier = block.tiers.find((t) => t.id === selection.tierId);
  if (!tier) return null;

  const monthly =
    selection.term === "24_months"
      ? (tier.monthlyCost24Minor ?? 0)
      : (tier.monthlyCost12Minor ?? 0);
  const monthlyTotal = packageMonthlyTotalMinor(block, selection, undefined, undefined, catalogServices);
  const upfrontMinor = packageTierUpfrontMinor(block, selection);
  const oneOffAddonsMinor = packageOneOffAddonsTotalMinor(
    block,
    selection,
    undefined,
    undefined,
    catalogServices,
  );

  const addonLines: PackageSelectionSummary["addonLines"] = [];
  if (packagesAddonsSectionActive(block)) {
    for (const li of block.addonLineItems ?? []) {
      const rawQ = selection.addonQuantities?.[li.id];
      const quantity =
        typeof rawQ === "number" && Number.isFinite(rawQ) && rawQ >= 0
          ? Math.floor(rawQ)
          : effectivePricingLineQuantity(li);
      if (quantity <= 0) continue;
      const billingKind = resolveProposalAddonBillingKind(li, catalogServices);
      const unitAmountMinor = effectiveCatalogAddonUnitAmount(li, selection.term);
      addonLines.push({
        id: li.id,
        label: li.label?.trim() || "Add-on",
        quantity,
        unitAmountMinor,
        lineTotalMinor: Math.round(unitAmountMinor * quantity),
        billingKind: billingKind === "one_off" ? "one_off" : "recurring",
      });
    }
  }

  return {
    blockId: block.id,
    blockTitle: block.title?.trim() || "Plan",
    currency: (block.currency || "aud").toUpperCase(),
    tierName: tier.name?.trim() || "Plan",
    termLabel: packagesSelectionTermLabel(block, selection.term),
    monthlyMinor: monthly,
    monthlyTotalMinor: monthlyTotal,
    upfrontMinor,
    oneOffAddonsMinor,
    addonLines,
    stripePriceId: tier.stripePriceId?.trim() || undefined,
  };
}

export function buildPackageSelectionSummariesForProposal(
  proposal: ProposalRecord,
  catalogServices: readonly CatalogServicePickerOption[] = [],
): PackageSelectionSummary[] {
  const blocks = packagesBlocksFromDocument(proposal.document.blocks);
  const selections = proposal.publicSelections;
  const out: PackageSelectionSummary[] = [];
  for (const pb of blocks) {
    const sel = selections?.[pb.id];
    if (!sel) continue;
    const built = buildPackageSelectionSummary(pb, sel, catalogServices);
    if (built) out.push(built);
  }
  return out;
}
