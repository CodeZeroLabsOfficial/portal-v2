"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { AgreementModalShell } from "@/components/features/proposal/agreement/agreement-modal-shell";
import { AgreementSummarySection } from "@/components/features/proposal/agreement/agreement-summary-section";
import { SignedAgreementPrintBody } from "@/components/features/proposal/agreement/signed-agreement-print-body";
import { printAgreementDocument } from "@/hooks/use-agreement-print-mode";
import {
  buildSignedStaffJumpNavItems,
  resolveSignedAgreementView,
} from "@/lib/proposal/agreement/signed-agreement-view";
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
  const signedView = React.useMemo(
    () =>
      data
        ? resolveSignedAgreementView({
            record: data.record,
            signatureSrc: data.signatureSrc,
            companyPrintName: data.companyPrintName,
          })
        : null,
    [data],
  );

  const jumpNavItems = React.useMemo(
    () => (signedView ? buildSignedStaffJumpNavItems(signedView) : []),
    [signedView],
  );

  function printSignedAgreement() {
    if (!signedView) return;
    printAgreementDocument(signedView);
  }

  return (
    <AgreementModalShell
      open={open}
      onOpenChange={onOpenChange}
      agreementTitle={signedView?.agreementTitle ?? "Services Agreement"}
      jumpNavItems={jumpNavItems}
      onDownload={printSignedAgreement}
      closeLabel="Close signed agreement"
      headerActions={
        <Badge variant="success" className="h-8 px-3 text-sm">
          Signed
        </Badge>
      }
    >
      {signedView ? (
        <SignedAgreementPrintBody
          signedView={signedView}
          afterTitle={<AgreementSummarySection record={signedView.record} />}
        />
      ) : null}
    </AgreementModalShell>
  );
}
