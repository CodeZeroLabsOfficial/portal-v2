import type { ReactNode } from "react";

import { AgreementModalPrintBody } from "@/components/features/proposal/agreement/agreement-modal-print-body";
import { printAgreementDocument } from "@/hooks/use-agreement-print-mode";
import type { FrozenAgreementView } from "@/lib/proposal/agreement/frozen-agreement-view";

export interface FrozenAgreementPrintBodyProps {
  frozenView: FrozenAgreementView;
  /** Screen-only blocks after the title page (summary, selection, intro, etc.). */
  afterTitle?: ReactNode;
}

/** Signed agreement print target — buyer and staff CRM use the same frozen snapshot props. */
export function FrozenAgreementPrintBody({ frozenView, afterTitle }: FrozenAgreementPrintBodyProps) {
  return (
    <AgreementModalPrintBody
      agreementTitle={frozenView.agreementTitle}
      legalHtml={frozenView.legalHtmlWithIds}
      signatureSrc={frozenView.signatureSrc}
      signerName={frozenView.signerName}
      signerOrganization={frozenView.signerOrganization}
      signedAt={frozenView.signedAt}
      showLegalSectionLabel
      companyPrintName={frozenView.companyPrintName}
      afterTitle={afterTitle}
    />
  );
}

export function printFrozenAgreementDocument(frozenView: FrozenAgreementView) {
  printAgreementDocument({ documentTitle: frozenView.agreementTitle });
}
