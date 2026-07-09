import type { CatalogServicePickerOption } from "@/types/catalog-service";
import type { ProposalRecord } from "@/types/proposal";
import { findFirstAgreementBlock } from "@/lib/proposal/blocks";
import { formatCurrencyAmount } from "@/lib/common/format";
import { buildPackageSelectionSummariesForProposal } from "@/lib/proposal/agreement/package-selection-summary";
import type { PackageSelectionSummary } from "@/lib/proposal/agreement/package-selection-summary";
import { sanitizeProposalHtmlServer } from "@/lib/proposal/sanitize-server";

export interface SignedAgreementAddonSnapshot {
  label: string;
  quantity: number;
  unitAmountMinor: number;
  lineTotalMinor: number;
  currency: string;
  packageBlockTitle?: string;
  billingKind: "recurring" | "one_off";
}

export interface SignedAgreementCommerceSnapshot {
  selectedPlan: string;
  addons: SignedAgreementAddonSnapshot[];
  packageSnapshots: PackageSelectionSummary[];
  upfrontOneOffMinor: number;
  oneOffAddonsTotalMinor: number;
  totalAmount: {
    currency: string;
    monthlyTotalMinor: number;
    formatted: string;
  };
}

/** Intro HTML snapshotted at sign time for post-sign agreement views. */
export function buildIntroAgreementHtmlSnapshot(proposal: ProposalRecord): string | undefined {
  const agreement = findFirstAgreementBlock(proposal.document.blocks);
  if (!agreement?.introHtml?.trim()) return undefined;
  return sanitizeProposalHtmlServer(agreement.introHtml.trim());
}

/**
 * Legal HTML only — snapshotted for post-sign agreement views (intro excluded).
 * When empty, returns undefined so UI uses built-in default sections.
 */
export function buildLegalAgreementHtmlSnapshot(proposal: ProposalRecord): string | undefined {
  const agreement = findFirstAgreementBlock(proposal.document.blocks);
  if (!agreement) return undefined;
  if (agreement.legalHtml?.trim()) {
    return sanitizeProposalHtmlServer(agreement.legalHtml.trim());
  }
  return undefined;
}

export function buildSignedAgreementCommerceSnapshot(
  proposal: ProposalRecord,
  catalogServices: readonly CatalogServicePickerOption[] = [],
): SignedAgreementCommerceSnapshot {
  const packageSnapshots = buildPackageSelectionSummariesForProposal(proposal, catalogServices);
  const planParts = packageSnapshots.map(
    (s) =>
      `${s.blockTitle}: ${s.tierName} — ${s.termLabel} (${formatCurrencyAmount(s.monthlyMinor, s.currency)}/mo)`,
  );

  const addons: SignedAgreementAddonSnapshot[] = [];
  let sumMonthly = 0;
  let upfrontOneOffMinor = 0;
  let oneOffAddonsTotalMinor = 0;
  let currency = "AUD";

  for (const snapshot of packageSnapshots) {
    currency = snapshot.currency;
    sumMonthly += snapshot.monthlyTotalMinor;
    upfrontOneOffMinor += snapshot.upfrontMinor;
    oneOffAddonsTotalMinor += snapshot.oneOffAddonsMinor;
    for (const line of snapshot.addonLines) {
      addons.push({
        label: line.label,
        quantity: line.quantity,
        unitAmountMinor: line.unitAmountMinor,
        lineTotalMinor: line.lineTotalMinor,
        currency: snapshot.currency,
        packageBlockTitle: snapshot.blockTitle,
        billingKind: line.billingKind,
      });
    }
  }

  const selectedPlan =
    planParts.length > 0 ? planParts.join(" | ") : "No package selection recorded";

  return {
    selectedPlan,
    addons,
    packageSnapshots,
    upfrontOneOffMinor,
    oneOffAddonsTotalMinor,
    totalAmount: {
      currency,
      monthlyTotalMinor: sumMonthly,
      formatted: formatCurrencyAmount(sumMonthly, currency),
    },
  };
}
