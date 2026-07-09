import type { ReactNode } from "react";

import { AgreementModalPrintBody } from "@/components/features/proposal/agreement/agreement-modal-print-body";
import type { SignedAgreementView } from "@/lib/proposal/agreement/signed-agreement-view";

export interface SignedAgreementPrintBodyProps {
  signedView: SignedAgreementView;
  /** Screen-only blocks after the title page (summary, selection, intro, etc.). */
  afterTitle?: ReactNode;
}

/** Signed agreement print target — buyer and staff CRM use the same signedAgreements row props. */
export function SignedAgreementPrintBody({ signedView, afterTitle }: SignedAgreementPrintBodyProps) {
  return (
    <AgreementModalPrintBody
      agreementTitle={signedView.agreementTitle}
      legalHtml={signedView.legalHtmlWithIds}
      signatureSrc={signedView.signatureSrc}
      signerName={signedView.signerName}
      signerOrganization={signedView.signerOrganization}
      signedAt={signedView.signedAt}
      showLegalSectionLabel
      companyPrintName={signedView.companyPrintName}
      afterTitle={afterTitle}
    />
  );
}
