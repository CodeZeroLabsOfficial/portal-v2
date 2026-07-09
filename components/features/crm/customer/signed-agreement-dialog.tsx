"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { AgreementModalShell } from "@/components/features/proposal/agreement/agreement-modal-shell";
import { AgreementSummarySection } from "@/components/features/proposal/agreement/agreement-summary-section";
import {
  FrozenAgreementPrintBody,
  printFrozenAgreementDocument,
} from "@/components/features/proposal/agreement/frozen-agreement-print-body";
import {
  buildFrozenStaffJumpNavItems,
  resolveFrozenAgreementView,
} from "@/lib/proposal/agreement/frozen-agreement-view";
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
  const frozenView = React.useMemo(
    () =>
      data
        ? resolveFrozenAgreementView({
            record: data.record,
            signatureSrc: data.signatureSrc,
            companyPrintName: data.companyPrintName,
          })
        : null,
    [data],
  );

  const jumpNavItems = React.useMemo(
    () => (frozenView ? buildFrozenStaffJumpNavItems(frozenView) : []),
    [frozenView],
  );

  function printSignedAgreement() {
    if (!frozenView) return;
    printFrozenAgreementDocument(frozenView);
  }

  return (
    <AgreementModalShell
      open={open}
      onOpenChange={onOpenChange}
      agreementTitle={frozenView?.agreementTitle ?? "Services Agreement"}
      jumpNavItems={jumpNavItems}
      onDownload={printSignedAgreement}
      closeLabel="Close signed agreement"
      headerActions={
        <Badge variant="success" className="h-8 px-3 text-sm">
          Signed
        </Badge>
      }
    >
      {frozenView ? (
        <FrozenAgreementPrintBody
          frozenView={frozenView}
          afterTitle={<AgreementSummarySection record={frozenView.record} />}
        />
      ) : null}
    </AgreementModalShell>
  );
}
