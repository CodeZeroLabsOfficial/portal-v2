import type { ReactNode } from "react";

import { AgreementPrintDocumentContent } from "@/components/features/proposal/agreement/agreement-print-document-content";
import { AgreementPrintFooter } from "@/components/features/proposal/agreement/agreement-print-footer";
import { AGREEMENT_PRINT_TARGET_ATTR } from "@/hooks/use-agreement-print-mode";
import { AGREEMENT_TOP_ANCHOR_ID } from "@/lib/proposal/agreement/modal-layout";
import { AGREEMENT_PRINT_TARGET_SHELL_CLASSES } from "@/lib/proposal/agreement/print-layout";

export interface AgreementModalPrintBodyProps {
  agreementTitle: string;
  legalHtml?: string;
  signatureSrc?: string | null;
  signerName?: string | null;
  signerOrganization?: string | null;
  signedAt?: number | null;
  showLegalSectionLabel?: boolean;
  afterTitle?: ReactNode;
  companyPrintName?: string;
  children?: ReactNode;
}

/** Shared print target shell — buyer and staff agreement modals. */
export function AgreementModalPrintBody({
  agreementTitle,
  legalHtml,
  signatureSrc,
  signerName,
  signerOrganization,
  signedAt,
  showLegalSectionLabel = false,
  afterTitle,
  companyPrintName,
  children,
}: AgreementModalPrintBodyProps) {
  return (
    <>
      <div {...{ [AGREEMENT_PRINT_TARGET_ATTR]: "" }} className={AGREEMENT_PRINT_TARGET_SHELL_CLASSES}>
        <div id={AGREEMENT_TOP_ANCHOR_ID} aria-hidden />
        <AgreementPrintDocumentContent
          agreementTitle={agreementTitle}
          legalHtml={legalHtml}
          signatureSrc={signatureSrc}
          signerName={signerName}
          signerOrganization={signerOrganization}
          signedAt={signedAt}
          showLegalSectionLabel={showLegalSectionLabel}
          afterTitle={afterTitle}
        />
        {children}
      </div>
      <AgreementPrintFooter companyName={companyPrintName} />
    </>
  );
}
