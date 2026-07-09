"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { AgreementModalShell } from "@/components/features/proposal/agreement/agreement-modal-shell";
import { AgreementPrintDocumentContent } from "@/components/features/proposal/agreement/agreement-print-document-content";
import { AgreementPrintFooter } from "@/components/features/proposal/agreement/agreement-print-footer";
import { AgreementSummarySection } from "@/components/features/proposal/agreement/agreement-summary-section";
import {
  AGREEMENT_PRINT_TARGET_ATTR,
  printAgreementDocument,
} from "@/hooks/use-agreement-print-mode";
import { injectAgreementLegalHeadingIds } from "@/lib/agreement/legal-headings";
import {
  buildAgreementLegalNavChildren,
  buildStaffAgreementJumpNavItems,
} from "@/lib/proposal/agreement/jump-nav";
import { AGREEMENT_TOP_ANCHOR_ID } from "@/lib/proposal/agreement/modal-layout";
import { AGREEMENT_PRINT_TARGET_SHELL_CLASSES } from "@/lib/proposal/agreement/print-layout";
import type { SignedAgreementRecord } from "@/types/signed-agreement";

interface SignedAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    record: SignedAgreementRecord;
    signatureSrc: string | null;
    companyPrintName?: string;
  } | null;
}

export function SignedAgreementDialog({ open, onOpenChange, data }: SignedAgreementDialogProps) {
  const agreementTitle =
    data?.record.agreementTitle?.trim() || data?.record.proposalTitle?.trim() || "Services Agreement";

  const rawLegalHtml =
    data?.record.legalHtmlSnapshot?.trim() || data?.record.fullAgreementText?.trim() || "";

  const legalWithHeadingIds = React.useMemo(() => {
    if (!rawLegalHtml) return { html: undefined, headings: [] as Array<{ id: string; label: string }> };
    if (rawLegalHtml.includes("<")) {
      return injectAgreementLegalHeadingIds(rawLegalHtml);
    }
    return { html: rawLegalHtml, headings: [] as Array<{ id: string; label: string }> };
  }, [rawLegalHtml]);

  const jumpNavItems = React.useMemo(
    () =>
      buildStaffAgreementJumpNavItems({
        agreementTitle,
        legalChildren: buildAgreementLegalNavChildren({
          hasCustomLegal: Boolean(rawLegalHtml),
          legalHeadings: legalWithHeadingIds.headings.map((h) => ({ id: h.id, label: h.label })),
        }),
      }),
    [agreementTitle, legalWithHeadingIds.headings, rawLegalHtml],
  );

  function printSignedAgreement() {
    printAgreementDocument({ documentTitle: agreementTitle });
  }

  return (
    <AgreementModalShell
      open={open}
      onOpenChange={onOpenChange}
      agreementTitle={agreementTitle}
      jumpNavItems={jumpNavItems}
      onDownload={printSignedAgreement}
      closeLabel="Close signed agreement"
      headerActions={
        <Badge variant="success" className="h-8 px-3 text-sm">
          Signed
        </Badge>
      }
    >
      {data ? (
        <>
          <div
            {...{ [AGREEMENT_PRINT_TARGET_ATTR]: "" }}
            className={AGREEMENT_PRINT_TARGET_SHELL_CLASSES}
          >
            <div id={AGREEMENT_TOP_ANCHOR_ID} aria-hidden />
            <AgreementPrintDocumentContent
              agreementTitle={agreementTitle}
              legalHtml={legalWithHeadingIds.html}
              signatureSrc={data.signatureSrc}
              signerName={data.record.signerName}
              signerOrganization={data.record.signerOrganization}
              signedAt={data.record.signedAt}
              showLegalSectionLabel
              afterTitle={<AgreementSummarySection record={data.record} />}
            />
          </div>
          <AgreementPrintFooter companyName={data.companyPrintName} />
        </>
      ) : null}
    </AgreementModalShell>
  );
}
