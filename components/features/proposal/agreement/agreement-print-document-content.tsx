import type { ReactNode } from "react";
import { AgreementDocumentTitle } from "@/components/features/proposal/agreement/agreement-document-title";
import { AgreementSectionLabel } from "@/components/features/proposal/agreement/agreement-section-label";
import { AgreementLegalContent } from "@/components/features/proposal/agreement/agreement-legal-content";
import { AgreementPrintFooter } from "@/components/features/proposal/agreement/agreement-print-footer";
import { AgreementPrintSignatureBlock } from "@/components/features/proposal/agreement/agreement-print-signature-block";
import { Typography } from "@/components/ui/typography";
import {
  AGREEMENT_PRINT_TITLE_PAGE_ATTR,
  AGREEMENT_PRINT_TITLE_PAGE_CLASSES,
} from "@/lib/proposal/agreement/print-layout";

export interface AgreementPrintDocumentContentProps {
  agreementTitle: string;
  companyPrintName?: string;
  legalHtml?: string;
  signatureSrc?: string | null;
  signerName?: string | null;
  signedAt?: number | null;
  /** Screen-only blocks inserted after the title page (intro, agreement summary, etc.). */
  afterTitle?: ReactNode;
  /** When set, shows “The agreement” label on screen above legal (hidden in print). */
  showLegalSectionLabel?: boolean;
}

/**
 * Shared agreement PDF body — title page, legal (no section label), optional signature, company footer.
 * Used by staff CRM signed-agreement download; mirrors the public agreement print structure.
 */
export function AgreementPrintDocumentContent({
  agreementTitle,
  companyPrintName,
  legalHtml,
  signatureSrc,
  signerName,
  signedAt,
  afterTitle,
  showLegalSectionLabel = false,
}: AgreementPrintDocumentContentProps) {
  const title = agreementTitle.trim() || "Services Agreement";
  const rawBody = legalHtml?.trim() ?? "";
  const bodyIsHtml = rawBody.includes("<");

  return (
    <>
      <div {...{ [AGREEMENT_PRINT_TITLE_PAGE_ATTR]: "" }} className={AGREEMENT_PRINT_TITLE_PAGE_CLASSES}>
        <AgreementDocumentTitle title={title} />
      </div>

      {afterTitle}

      <section id="agreement-legal" className="mt-12 print:mt-0">
        {showLegalSectionLabel ? (
          <AgreementSectionLabel className="print:hidden">The agreement</AgreementSectionLabel>
        ) : null}
        <div className={showLegalSectionLabel ? "mt-6 print:mt-0" : "print:mt-0"}>
          {!rawBody ? (
            <AgreementLegalContent />
          ) : bodyIsHtml ? (
            <AgreementLegalContent legalHtml={rawBody} />
          ) : (
            <Typography className="whitespace-pre-wrap text-sm leading-relaxed">{rawBody}</Typography>
          )}
        </div>
      </section>

      <AgreementPrintSignatureBlock
        signatureSrc={signatureSrc}
        signerName={signerName}
        signedAt={signedAt}
      />

      <AgreementPrintFooter companyName={companyPrintName} />
    </>
  );
}
