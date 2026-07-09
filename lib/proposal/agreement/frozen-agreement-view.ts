import { injectAgreementLegalHeadingIds } from "@/lib/agreement/legal-headings";
import {
  buildAgreementLegalNavChildren,
  buildBuyerAgreementJumpNavItems,
  buildStaffAgreementJumpNavItems,
  type AgreementJumpItem,
  type AgreementJumpNavChild,
} from "@/lib/proposal/agreement/jump-nav";
import { packageSummariesFromSignedRecord } from "@/lib/proposal/agreement/signed-record-package-summaries";
import type { PackageSelectionSummary } from "@/lib/proposal/agreement/package-selection-summary";
import type { SignedAgreementRecord } from "@/types/signed-agreement";

const DEFAULT_AGREEMENT_TITLE = "Services Agreement";

export interface FrozenAgreementViewInput {
  record: SignedAgreementRecord;
  signatureSrc: string | null;
  companyPrintName?: string;
}

export interface FrozenAgreementView {
  record: SignedAgreementRecord;
  agreementTitle: string;
  introHtml: string | undefined;
  legalHtml: string | undefined;
  introHtmlWithIds: string;
  legalHtmlWithIds: string;
  introHeadings: AgreementJumpNavChild[];
  legalHeadings: AgreementJumpNavChild[];
  hasCustomLegal: boolean;
  packageSummaries: PackageSelectionSummary[];
  signerName: string | null;
  signerOrganization: string | null;
  signedAt: number | null;
  signatureSrc: string | null;
  companyPrintName?: string;
}

function resolveFrozenIntroHtml(record: SignedAgreementRecord): string | undefined {
  const intro = record.introHtmlSnapshot?.trim();
  return intro || undefined;
}

function resolveFrozenLegalHtml(record: SignedAgreementRecord): string | undefined {
  const legal = record.legalHtmlSnapshot?.trim();
  return legal || undefined;
}

/** Normalizes a signedAgreements row for buyer/staff modal + PDF rendering. */
export function resolveFrozenAgreementView(input: FrozenAgreementViewInput): FrozenAgreementView {
  const { record, signatureSrc, companyPrintName } = input;

  const agreementTitle =
    record.agreementTitle?.trim() || record.proposalTitle?.trim() || DEFAULT_AGREEMENT_TITLE;

  const introHtml = resolveFrozenIntroHtml(record);
  const legalHtml = resolveFrozenLegalHtml(record);
  const hasCustomLegal = Boolean(record.legalHtmlSnapshot?.trim());

  const introWithHeadingIds = introHtml
    ? injectAgreementLegalHeadingIds(introHtml, { idPrefix: "agreement-intro" })
    : { html: "", headings: [] as Array<{ id: string; label: string }> };

  const legalWithHeadingIds = legalHtml
    ? injectAgreementLegalHeadingIds(legalHtml)
    : { html: "", headings: [] as Array<{ id: string; label: string }> };

  const introHeadings = introWithHeadingIds.headings.map((h) => ({ id: h.id, label: h.label }));
  const legalHeadings = legalWithHeadingIds.headings.map((h) => ({ id: h.id, label: h.label }));

  return {
    record,
    agreementTitle,
    introHtml,
    legalHtml,
    introHtmlWithIds: introWithHeadingIds.html,
    legalHtmlWithIds: legalWithHeadingIds.html,
    introHeadings,
    legalHeadings,
    hasCustomLegal,
    packageSummaries: packageSummariesFromSignedRecord(record),
    signerName: record.signerName?.trim() || null,
    signerOrganization: record.signerOrganization?.trim() || null,
    signedAt: record.signedAt > 0 ? record.signedAt : null,
    signatureSrc,
    companyPrintName,
  };
}

export function buildFrozenBuyerJumpNavItems(view: FrozenAgreementView): AgreementJumpItem[] {
  return buildBuyerAgreementJumpNavItems({
    agreementTitle: view.agreementTitle,
    hasPackageSummaries: view.packageSummaries.length > 0,
    legalChildren: buildAgreementLegalNavChildren({
      introHeadings: view.introHeadings,
      legalHeadings: view.legalHeadings,
      hasCustomLegal: view.hasCustomLegal,
    }),
    accepted: true,
  });
}

export function buildFrozenStaffJumpNavItems(view: FrozenAgreementView): AgreementJumpItem[] {
  return buildStaffAgreementJumpNavItems({
    agreementTitle: view.agreementTitle,
    legalChildren: buildAgreementLegalNavChildren({
      hasCustomLegal: view.hasCustomLegal,
      legalHeadings: view.legalHeadings,
    }),
  });
}
