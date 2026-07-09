import type { CatalogServicePickerOption } from "@/types/catalog-service";
import type { ProposalRecord } from "@/types/proposal";
import { findFirstAgreementBlock } from "@/lib/proposal/blocks";
import { formatCurrencyAmount } from "@/lib/common/format";
import { buildPackageSelectionSummariesForProposal } from "@/lib/proposal/agreement/package-selection-summary";
import type { PackageSelectionSummary } from "@/lib/proposal/agreement/package-selection-summary";
import { sanitizeProposalHtmlServer } from "@/lib/proposal/sanitize-server";

const FULL_AGREEMENT_TEXT_MAX = 120_000;

const DEFAULT_LEGAL_SNAPSHOT = [
  "1. Parties — Service provider and customer as identified on the proposal.",
  "2. Scope — Products, services, and deliverables in the proposal including selected plan and add-ons.",
  "3. Pricing & Payment — Fees per proposal schedule; invoices due within 14 days unless stated.",
  "4. Term — Begins on signature; renews per proposal commitment unless non-renewal notice.",
  "5. Termination — Material breach with cure period; fees accrued through termination date.",
  "6. Confidentiality — Non-public information treated as confidential.",
  "7. Warranties & Liability — As stated in proposal; capped liability.",
  "8. Governing Law — Provider jurisdiction.",
].join("\n\n");

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

/** Plain-ish snapshot for audit (truncated HTML or default section summary). */
export function buildFullAgreementTextSnapshot(proposal: ProposalRecord): string | undefined {
  const agreement = findFirstAgreementBlock(proposal.document.blocks);
  if (!agreement) return undefined;
  const chunks: string[] = [];
  if (agreement.introHtml?.trim()) {
    chunks.push(sanitizeProposalHtmlServer(agreement.introHtml.trim()));
  }
  if (agreement.legalHtml?.trim()) {
    chunks.push(sanitizeProposalHtmlServer(agreement.legalHtml.trim()));
  } else {
    chunks.push(DEFAULT_LEGAL_SNAPSHOT);
  }
  const out = chunks.join("\n\n");
  if (out.length <= FULL_AGREEMENT_TEXT_MAX) return out;
  return `${out.slice(0, FULL_AGREEMENT_TEXT_MAX)}\n…`;
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
