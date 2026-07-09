import { AgreementDocumentTitle } from "@/components/features/proposal/agreement/agreement-document-title";
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
}: AgreementPrintDocumentContentProps) {
  const title = agreementTitle.trim() || "Services Agreement";
  const rawBody = legalHtml?.trim() ?? "";
  const bodyIsHtml = rawBody.includes("<");

  return (
    <>
      <div {...{ [AGREEMENT_PRINT_TITLE_PAGE_ATTR]: "" }} className={AGREEMENT_PRINT_TITLE_PAGE_CLASSES}>
        <AgreementDocumentTitle title={title} />
      </div>

      <section id="agreement-legal" className="mt-12 print:mt-0">
        <div className="mt-6 print:mt-0">
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
