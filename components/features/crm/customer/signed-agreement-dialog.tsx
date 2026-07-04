"use client";

import * as React from "react";
import { ArrowRight, Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AGREEMENT_PRINT_EXCLUDE_ATTR,
  AGREEMENT_PRINT_TARGET_ATTR,
  printAgreementDocument,
  useAgreementPrintMode
} from "@/hooks/use-agreement-print-mode";
import { sanitizeProposalHtml } from "@/lib/proposal/sanitize";
import { cn } from "@/lib/utils";
import type { SignedAgreementRecord } from "@/types/signed-agreement";

interface SignedAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: { record: SignedAgreementRecord; signatureSrc: string | null } | null;
}

function AgreementPrintSignatureBlock({
  signatureSrc,
  signerName,
  signedAt
}: {
  signatureSrc: string | null | undefined;
  signerName?: string | null;
  signedAt?: number | null;
}) {
  if (!signatureSrc?.trim()) return null;

  const signedLabel =
    signedAt && signedAt > 0
      ? new Date(signedAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short"
        })
      : null;

  return (
    <section className="mt-12 hidden print:block">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">Signature</p>
      <div className="mt-6 border-t border-zinc-200 pt-8">
        {signerName?.trim() ? (
          <p className="text-sm font-semibold text-zinc-900">{signerName.trim()}</p>
        ) : null}
        {signedLabel ? <p className="mt-1 text-xs text-zinc-500">Signed {signedLabel}</p> : null}
        <div className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={signatureSrc}
            alt={signerName?.trim() ? `Signature of ${signerName.trim()}` : "Signature"}
            className="max-h-36 max-w-full object-contain object-left"
          />
        </div>
      </div>
    </section>
  );
}

export function SignedAgreementDialog({ open, onOpenChange, data }: SignedAgreementDialogProps) {
  const signatureRef = React.useRef<HTMLDivElement | null>(null);
  useAgreementPrintMode();

  function printSignedAgreement() {
    const title = data?.record.proposalTitle?.trim() || "Services Agreement";
    printAgreementDocument({ documentTitle: title });
  }

  function scrollToSignature() {
    signatureRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "z-50 grid gap-0 overflow-hidden border-0 bg-white p-0 text-zinc-900 shadow-2xl",
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
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 print:hidden">
              <DialogTitle className="truncate text-sm font-semibold tracking-tight text-zinc-900 sm:text-base">
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
                  variant="default"
                  onClick={scrollToSignature}
                  className="h-9 gap-1.5 rounded-md px-3 font-semibold shadow-sm">
                  Next
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
                <DialogClose
                  aria-label="Close signed agreement"
                  className="ml-1 inline-flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">
                  <X className="size-5" aria-hidden />
                </DialogClose>
              </div>
            </div>
            <div className="min-h-0 overflow-y-auto bg-white print:overflow-visible">
              <div
                {...{ [AGREEMENT_PRINT_TARGET_ATTR]: "" }}
                className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-10 sm:py-14">
                <header {...{ [AGREEMENT_PRINT_EXCLUDE_ATTR]: "" }} className="text-center print:hidden">
                  <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                    Signed agreement
                  </h2>
                  <p className="mt-2 text-sm font-medium text-zinc-500">
                    Re: <span className="text-zinc-900">{data.record.proposalTitle}</span>
                  </p>
                  <p className="mt-3 text-xs text-zinc-500">
                    Signed{" "}
                    {data.record.signedAt > 0
                      ? new Date(data.record.signedAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })
                      : "—"}{" "}
                    · Signer: {data.record.signerName}
                    {data.record.signerEmail ? <> · Email: {data.record.signerEmail}</> : null}
                    {data.record.signerOrganization ? <> · Org: {data.record.signerOrganization}</> : null} ·
                    Monthly total: {data.record.totalAmount.formatted}
                  </p>
                </header>

                <section className="mt-10">
                  <h3 className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">
                    Agreement
                  </h3>
                  {(() => {
                    const rawBody = data.record.fullAgreementText?.trim() ?? "";
                    const bodyIsHtml = rawBody.includes("<");
                    if (!rawBody) {
                      return (
                        <p className="mt-3 text-sm text-zinc-500">
                          No agreement text snapshot for this record.
                        </p>
                      );
                    }
                    if (bodyIsHtml) {
                      return (
                        <div
                          className={cn(
                            "proposal-rich-text mt-4 max-w-none text-[15px] leading-relaxed text-zinc-700",
                            "[&_h1]:mt-8 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-zinc-900",
                            "[&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-900",
                            "[&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-900",
                            "[&_p]:mb-3 [&_p:last-child]:mb-0",
                            "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5",
                            "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5"
                          )}
                          dangerouslySetInnerHTML={{ __html: sanitizeProposalHtml(rawBody) }}
                        />
                      );
                    }
                    return (
                      <div className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-zinc-700">
                        {rawBody}
                      </div>
                    );
                  })()}
                </section>

                <AgreementPrintSignatureBlock
                  signatureSrc={data.signatureSrc}
                  signerName={data.record.signerName}
                  signedAt={data.record.signedAt}
                />

                <section
                  ref={signatureRef}
                  id="customer-signed-agreement-signature"
                  className="mt-12 scroll-mt-24 print:hidden">
                  <h3 className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">
                    Signature
                  </h3>
                  {data.signatureSrc ? (
                    <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={data.signatureSrc}
                        alt={`Signature of ${data.record.signerName}`}
                        className="max-h-40 max-w-full object-contain object-left"
                      />
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-zinc-500">
                      No signature image on file (or it could not be loaded from storage).
                    </p>
                  )}
                  {data.record.signatureMethod ? (
                    <p className="mt-2 text-xs text-zinc-500 capitalize">
                      Method: {data.record.signatureMethod}
                    </p>
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
