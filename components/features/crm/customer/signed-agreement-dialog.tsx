"use client";

import * as React from "react";
import { Download, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AgreementPrintDocumentContent } from "@/components/features/proposal/agreement/agreement-print-document-content";
import { AgreementSummarySection } from "@/components/features/proposal/agreement/agreement-summary-section";
import {
  AGREEMENT_PRINT_TARGET_ATTR,
  printAgreementDocument,
  useAgreementPrintMode,
} from "@/hooks/use-agreement-print-mode";
import { AGREEMENT_MODAL_HEADER_TITLE_CLASSES } from "@/lib/proposal/agreement/chrome-typography";
import { AGREEMENT_PRINT_TARGET_SHELL_CLASSES } from "@/lib/proposal/agreement/print-layout";
import { AGREEMENT_MODAL_LIGHT_SURFACE_CLASSES } from "@/lib/proposal/editor-surface-tokens";
import { cn } from "@/lib/utils";
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
  useAgreementPrintMode();

  const agreementTitle =
    data?.record.agreementTitle?.trim() || data?.record.proposalTitle?.trim() || "Services Agreement";

  const legalHtml =
    data?.record.legalHtmlSnapshot?.trim() || data?.record.fullAgreementText?.trim() || undefined;

  function printSignedAgreement() {
    printAgreementDocument({ documentTitle: agreementTitle });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          AGREEMENT_MODAL_LIGHT_SURFACE_CLASSES,
          "z-50 grid gap-0 overflow-hidden border-0 p-0 shadow-2xl",
          "h-dvh w-screen max-w-none top-0 left-0 translate-x-0 translate-y-0 rounded-none",
          "sm:top-1/2 sm:left-1/2 sm:h-[min(96dvh,960px)] sm:max-h-[96dvh]",
          "sm:w-[min(1536px,calc(100vw-3rem))] sm:max-w-[min(1536px,calc(100vw-3rem))]",
          "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
          "print:static print:inset-auto print:h-auto print:max-h-none print:w-full print:max-w-none",
          "print:translate-x-0 print:translate-y-0 print:rounded-none print:shadow-none print:overflow-visible",
          "grid-rows-[auto,1fr] print:grid-rows-1",
        )}>
        {data ? (
          <>
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 print:hidden">
              <DialogTitle className={AGREEMENT_MODAL_HEADER_TITLE_CLASSES}>{agreementTitle}</DialogTitle>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={printSignedAgreement}
                  className="aspect-square max-sm:p-0">
                  <Download aria-hidden className="opacity-60 sm:-ms-1" size={16} />
                  <span className="max-sm:sr-only">Download</span>
                </Button>
                <Badge variant="success" className="h-8 px-3 text-sm">
                  Signed
                </Badge>
                <DialogClose asChild>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Close signed agreement">
                    <X className="size-5" aria-hidden />
                  </Button>
                </DialogClose>
              </div>
            </div>
            <div className="min-h-0 overflow-y-auto print:overflow-visible">
              <div
                {...{ [AGREEMENT_PRINT_TARGET_ATTR]: "" }}
                className={AGREEMENT_PRINT_TARGET_SHELL_CLASSES}>
                <div id="agreement-top" aria-hidden />
                <AgreementPrintDocumentContent
                  agreementTitle={agreementTitle}
                  companyPrintName={data.companyPrintName}
                  legalHtml={legalHtml}
                  signatureSrc={data.signatureSrc}
                  signerName={data.record.signerName}
                  signedAt={data.record.signedAt}
                  showLegalSectionLabel
                  afterTitle={<AgreementSummarySection record={data.record} />}
                />
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
