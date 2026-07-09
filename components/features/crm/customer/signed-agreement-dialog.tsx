"use client";

import * as React from "react";
import { ArrowRight, Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { AgreementPrintDocumentContent } from "@/components/features/proposal/agreement/agreement-print-document-content";
import { AgreementSectionLabel } from "@/components/features/proposal/agreement/agreement-section-label";
import {
  AGREEMENT_PRINT_EXCLUDE_ATTR,
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
  const signatureRef = React.useRef<HTMLDivElement | null>(null);
  useAgreementPrintMode();

  const agreementTitle =
    data?.record.agreementTitle?.trim() || data?.record.proposalTitle?.trim() || "Services Agreement";

  function printSignedAgreement() {
    printAgreementDocument({ documentTitle: agreementTitle });
  }

  function scrollToSignature() {
    signatureRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
              <DialogTitle className={AGREEMENT_MODAL_HEADER_TITLE_CLASSES}>
                {data.record.proposalTitle}
              </DialogTitle>
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
                <Button
                  type="button"
                  size="sm"
                  onClick={scrollToSignature}
                  className="gap-1.5">
                  Next
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
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
                <header {...{ [AGREEMENT_PRINT_EXCLUDE_ATTR]: "" }} className="text-center print:hidden">
                  <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-4xl">
                    Signed agreement
                  </h2>
                  <Typography variant="muted" className="mt-2 font-medium">
                    Re: <span className="text-foreground">{data.record.proposalTitle}</span>
                  </Typography>
                  <Typography variant="muted" className="mt-3 text-xs">
                    Signed{" "}
                    {data.record.signedAt > 0
                      ? new Date(data.record.signedAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}{" "}
                    · Signer: {data.record.signerName}
                    {data.record.signerEmail ? <> · Email: {data.record.signerEmail}</> : null}
                    {data.record.signerOrganization ? <> · Org: {data.record.signerOrganization}</> : null} ·
                    Monthly total: {data.record.totalAmount.formatted}
                  </Typography>
                </header>

                <AgreementPrintDocumentContent
                  agreementTitle={agreementTitle}
                  companyPrintName={data.companyPrintName}
                  legalHtml={data.record.fullAgreementText}
                  signatureSrc={data.signatureSrc}
                  signerName={data.record.signerName}
                  signedAt={data.record.signedAt}
                />

                <section
                  ref={signatureRef}
                  id="customer-signed-agreement-signature"
                  className="mt-12 scroll-mt-24 print:hidden">
                  <AgreementSectionLabel>Signature</AgreementSectionLabel>
                  {data.signatureSrc ? (
                    <Card className="mt-4 border-dashed bg-muted/30 py-4 shadow-none">
                      <CardContent>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={data.signatureSrc}
                          alt={`Signature of ${data.record.signerName}`}
                          className="max-h-40 max-w-full object-contain object-left"
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <Typography variant="muted" className="mt-4">
                      No signature image on file (or it could not be loaded from storage).
                    </Typography>
                  )}
                  {data.record.signatureMethod ? (
                    <Typography variant="muted" className="mt-2 text-xs capitalize">
                      Method: {data.record.signatureMethod}
                    </Typography>
                  ) : null}
                </section>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
