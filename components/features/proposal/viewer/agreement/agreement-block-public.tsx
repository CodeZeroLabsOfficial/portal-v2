"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DialogClose } from "@/components/ui/dialog";
import { AgreementModalShell } from "@/components/features/proposal/agreement/agreement-modal-shell";
import { AgreementDocumentIntro } from "@/components/features/proposal/agreement/agreement-document-intro";
import { AgreementModalPrintBody } from "@/components/features/proposal/agreement/agreement-modal-print-body";
import { SignedAgreementPrintBody } from "@/components/features/proposal/agreement/signed-agreement-print-body";
import {
  AgreementSelectionSection,
  NoPackageSelectionCard,
} from "@/components/features/proposal/agreement/agreement-selection-section";
import { AgreementSignatureForm } from "@/components/features/proposal/viewer/agreement/agreement-signature-form";
import { Typography } from "@/components/ui/typography";
import type {
  AgreementBlock,
  ProposalAgreementChildBlock,
  ProposalBlock,
  ProposalCustomerSignerPrefill,
  ProposalPublicSelections,
  ProposalStatus,
} from "@/types/proposal";
import type { SignedAgreementContext } from "@/lib/proposal/block-view-types";
import { readableForeground, resolveAgreementButtonColor } from "@/lib/proposal/block-style";
import type { CatalogServicePickerOption } from "@/types/catalog-service";
import { injectAgreementLegalHeadingIds } from "@/lib/agreement/legal-headings";
import { PROPOSAL_EDITOR_SECTION_INNER_PAD_CLASSES } from "@/lib/proposal/public/public-layout";
import {
  buildAgreementLegalNavChildren,
  buildBuyerAgreementJumpNavItems,
  scrollAgreementContainerToRef,
} from "@/lib/proposal/agreement/jump-nav";
import {
  buildSignedBuyerJumpNavItems,
  resolveSignedAgreementView,
} from "@/lib/proposal/agreement/signed-agreement-view";
import { AGREEMENT_SIGN_SECTION_ID, AGREEMENT_TOP_ANCHOR_ID } from "@/lib/proposal/agreement/modal-layout";
import {
  buildPackageSelectionSummary,
  packagesBlocksFromDocument,
} from "@/lib/proposal/agreement/package-selection-summary";
import type { PackageSelectionSummary } from "@/lib/proposal/agreement/package-selection-summary";
import { AGREEMENT_PRINT_EXCLUDE_ATTR, printAgreementDocument } from "@/hooks/use-agreement-print-mode";
import { isDocumentPackageSelectionComplete } from "@/lib/proposal/commerce/package-selection";
import type { ProposalPublicSubscriptionUi } from "@/server/proposal/public-proposal-subscription-ui";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface AgreementBlockPublicProps {
  block: AgreementBlock;
  /** All top-level blocks — used to summarise the buyer's plan + add-on selection. */
  allBlocks: ProposalBlock[];
  shareToken?: string;
  publicSelections?: ProposalPublicSelections;
  /** Current proposal status — drives the “accepted” state in the modal footer. */
  proposalStatus?: ProposalStatus;
  acceptedByName?: string;
  acceptedSignerOrganization?: string;
  acceptedSignatureDataUrl?: string;
  /** Server acceptance timestamp (ms). */
  acceptedAt?: number;
  /** Staff locality IANA zone — signing UI default date and typed-signature label use this. */
  localityTimeZone?: string;
  /** When set after acceptance, buyer can complete the same subscription flow as admin (prefilled). */
  publicSubscriptionUi?: ProposalPublicSubscriptionUi | null;
  /** CRM-linked customer fields for agreement pre-fill (public page only). */
  customerSignerPrefill?: ProposalCustomerSignerPrefill | null;
  /** Active catalogue — recurring vs one-off add-on labels in the agreement summary. */
  catalogServices?: readonly CatalogServicePickerOption[];
  stripePublishableKey?: string;
  /** Settings → Company name — agreement PDF footer. */
  companyPrintName?: string;
  /** signedAgreements row — post-sign modal reads contract copy from here. */
  signedAgreement?: SignedAgreementContext | null;
  /** When false (editor / preview) the CTA is disabled and the sign form is read-only. */
  interactive?: boolean;
  /** Renders nested blocks above the sign button (same pipeline as the public document viewer). */
  renderAgreementChild: (child: ProposalAgreementChildBlock) => React.ReactNode;
}

const DEFAULT_BUTTON_LABEL = "View Agreement";
const DEFAULT_AGREEMENT_TITLE = "Services Agreement";

function AgreementModalPendingBody() {
  return (
    <div
      {...{ [AGREEMENT_PRINT_EXCLUDE_ATTR]: "" }}
      className="mx-auto w-full max-w-6xl space-y-8 px-5 py-12 sm:px-10 sm:py-16 print:hidden"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="mx-auto h-12 w-2/3 max-w-md" />
      <div className="mx-auto mt-10 max-w-2xl space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
      </div>
      <p className="text-center text-sm text-muted-foreground">Loading your signed agreement…</p>
    </div>
  );
}

const PENDING_SIGNED_JUMP_NAV_ITEMS = [
  { kind: "link" as const, id: AGREEMENT_TOP_ANCHOR_ID, label: "Top of agreement" },
  { kind: "link" as const, id: AGREEMENT_SIGN_SECTION_ID, label: "Signature" },
];

export function AgreementBlockPublic({
  block,
  allBlocks,
  shareToken,
  publicSelections,
  proposalStatus,
  acceptedByName,
  acceptedSignerOrganization,
  acceptedSignatureDataUrl,
  acceptedAt,
  localityTimeZone,
  interactive = true,
  publicSubscriptionUi = null,
  customerSignerPrefill = null,
  catalogServices = [],
  stripePublishableKey,
  companyPrintName,
  signedAgreement = null,
  renderAgreementChild,
}: AgreementBlockPublicProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [localAcceptedName, setLocalAcceptedName] = React.useState<string | null>(null);
  const [localAcceptedOrganization, setLocalAcceptedOrganization] = React.useState<string | null>(null);
  const [localSignatureDataUrl, setLocalSignatureDataUrl] = React.useState<string | null>(null);
  const [localDone, setLocalDone] = React.useState(proposalStatus === "accepted");

  React.useEffect(() => {
    setLocalDone(proposalStatus === "accepted");
  }, [proposalStatus]);

  const buttonLabel = block.buttonLabel?.trim() || DEFAULT_BUTTON_LABEL;
  const buttonAlign = block.buttonAlign ?? "center";
  const liveAgreementTitle = block.agreementTitle?.trim() || DEFAULT_AGREEMENT_TITLE;
  const eSignaturesEnabled = block.eSignaturesEnabled !== false;
  const electronicSignatureDisclaimerEnabled = block.electronicSignatureDisclaimerEnabled !== false;
  const termsReadDisclaimerEnabled = block.termsReadDisclaimerEnabled !== false;
  const requireAcceptTerms = block.requireAcceptTerms !== false;
  const ctaColor = resolveAgreementButtonColor(block.style);
  const ctaForeground = readableForeground(ctaColor);

  const livePackageSummaries = React.useMemo(() => {
    const blocks = packagesBlocksFromDocument(allBlocks);
    const out: PackageSelectionSummary[] = [];
    for (const pb of blocks) {
      const sel = publicSelections?.[pb.id];
      if (!sel) continue;
      const built = buildPackageSelectionSummary(pb, sel, catalogServices);
      if (built) out.push(built);
    }
    return out;
  }, [allBlocks, publicSelections, catalogServices]);

  const planSelectionComplete = React.useMemo(
    () => isDocumentPackageSelectionComplete(allBlocks, publicSelections),
    [allBlocks, publicSelections],
  );

  const subscriptionMonthly = React.useMemo(() => {
    if (livePackageSummaries.length === 0) return null;
    const total = livePackageSummaries.reduce((acc, s) => acc + s.monthlyTotalMinor, 0);
    const currency = livePackageSummaries[0]?.currency ?? "AUD";
    return { total, currency };
  }, [livePackageSummaries]);

  const accepted = localDone || proposalStatus === "accepted";

  const signedView = React.useMemo(() => {
    if (!accepted || !signedAgreement) return null;
    return resolveSignedAgreementView({
      record: signedAgreement.record,
      signatureSrc: signedAgreement.signatureSrc,
      companyPrintName,
    });
  }, [accepted, signedAgreement, companyPrintName]);

  const hasSignatureOnRecord = Boolean(
    acceptedSignatureDataUrl?.trim() ||
      localSignatureDataUrl?.trim() ||
      signedAgreement?.signatureSrc,
  );

  const signedAgreementRequired = accepted && hasSignatureOnRecord;
  const signedAgreementPending = signedAgreementRequired && !signedView;

  const liveHasCustomLegal = Boolean(block.legalHtml?.trim());

  const introWithHeadingIds = React.useMemo(() => {
    if (!block.introHtml?.trim()) return { html: "", headings: [] };
    return injectAgreementLegalHeadingIds(block.introHtml.trim(), { idPrefix: "agreement-intro" });
  }, [block.introHtml]);

  const legalWithHeadingIds = React.useMemo(() => {
    if (!block.legalHtml?.trim()) return { html: "", headings: [] };
    return injectAgreementLegalHeadingIds(block.legalHtml.trim());
  }, [block.legalHtml]);

  const modalAgreementTitle = signedView?.agreementTitle ?? liveAgreementTitle;
  const modalIntroHtml = signedView?.introHtmlWithIds ?? introWithHeadingIds.html;
  const modalLegalHtml = signedView?.legalHtmlWithIds ?? legalWithHeadingIds.html;
  const modalPackageSummaries = signedView?.packageSummaries ?? livePackageSummaries;
  const modalHasCustomLegal = signedView?.hasCustomLegal ?? liveHasCustomLegal;

  const jumpNavItems = React.useMemo(() => {
    if (signedAgreementPending) {
      return PENDING_SIGNED_JUMP_NAV_ITEMS;
    }
    if (signedView) {
      return buildSignedBuyerJumpNavItems(signedView);
    }
    return buildBuyerAgreementJumpNavItems({
      agreementTitle: liveAgreementTitle,
      hasPackageSummaries: livePackageSummaries.length > 0,
      legalChildren: buildAgreementLegalNavChildren({
        introHeadings: introWithHeadingIds.headings.map((h) => ({ id: h.id, label: h.label })),
        legalHeadings: legalWithHeadingIds.headings.map((h) => ({ id: h.id, label: h.label })),
        hasCustomLegal: liveHasCustomLegal,
      }),
      accepted,
    });
  }, [
    signedAgreementPending,
    signedView,
    liveAgreementTitle,
    livePackageSummaries.length,
    introWithHeadingIds.headings,
    legalWithHeadingIds.headings,
    liveHasCustomLegal,
    accepted,
  ]);

  const displayName = signedView?.signerName ?? localAcceptedName ?? acceptedByName;
  const displayOrganization =
    signedView?.signerOrganization ?? localAcceptedOrganization ?? acceptedSignerOrganization;
  const signatureDataUrl =
    signedView?.signatureSrc ?? localSignatureDataUrl ?? acceptedSignatureDataUrl ?? null;
  const signedAtMs =
    signedView?.signedAt ?? (accepted && acceptedAt ? acceptedAt : null);
  const blockAgreementUntilPlanPicked = interactive && !accepted && !planSelectionComplete;
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const signRef = React.useRef<HTMLDivElement | null>(null);

  function scrollToSignSection() {
    scrollAgreementContainerToRef(scrollRef.current, signRef);
  }

  function onDownload() {
    if (signedAgreementRequired) {
      if (!signedView) {
        toast.error("Your signed agreement is still loading. Please try again in a moment.");
        return;
      }
      printAgreementDocument(signedView);
      return;
    }
    printAgreementDocument({ documentTitle: modalAgreementTitle });
  }

  async function onSign(
    payload: {
      signerName: string;
      signerEmail: string;
      signerOrganization?: string;
      signatureDataUrl?: string;
      signatureMethod?: "draw" | "type" | "upload";
      clientSignedAt: number;
    },
    meta?: { subscriptionError?: string | null },
  ) {
    if (!shareToken || !interactive) return;
    setError(null);
    setLocalAcceptedName(payload.signerName);
    if (payload.signerOrganization?.trim()) {
      setLocalAcceptedOrganization(payload.signerOrganization.trim());
    }
    if (payload.signatureDataUrl) {
      setLocalSignatureDataUrl(payload.signatureDataUrl);
    }
    setLocalDone(true);
    if (meta?.subscriptionError) {
      toast.error(meta.subscriptionError);
      toast.success("Agreement signed.");
    } else {
      toast.success("Agreement signed. Thank you.");
    }
    router.refresh();
  }

  const printFooterName = signedView?.companyPrintName ?? companyPrintName;

  const buyerScreenAfterTitle = (
    <>
      <div {...{ [AGREEMENT_PRINT_EXCLUDE_ATTR]: "" }} className="print:hidden">
        <AgreementDocumentIntro introHtml={modalIntroHtml} />
      </div>
      <AgreementSelectionSection summaries={modalPackageSummaries} />
      {!modalPackageSummaries.length && !modalHasCustomLegal ? <NoPackageSelectionCard /> : null}
    </>
  );

  return (
    <div className="w-full">
      <div
        className={cn(
          "mx-auto flex w-full max-w-2xl flex-col gap-6",
          PROPOSAL_EDITOR_SECTION_INNER_PAD_CLASSES,
        )}
      >
        <div className="flex w-full min-w-0 flex-col gap-0 text-left">
          {(block.children ?? []).map((child) => (
            <div key={child.id} className="w-full min-w-0">
              {renderAgreementChild(child)}
            </div>
          ))}
        </div>
        <div
          className={cn(
            "flex flex-col gap-4",
            buttonAlign === "start" ? "items-stretch text-left" : "items-center text-center",
          )}
        >
          {blockAgreementUntilPlanPicked ? (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "inline-flex max-w-full",
                      buttonAlign === "start" ? "justify-start" : "justify-center",
                    )}
                  >
                    <Button
                      type="button"
                      size="lg"
                      disabled
                      className="max-w-full"
                      style={{ backgroundColor: ctaColor, color: ctaForeground }}
                    >
                      {buttonLabel}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-left text-sm leading-snug">
                  Select a plan in the proposal above first. Your choice appears in the agreement
                  automatically.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={() => setOpen(true)}
              disabled={!interactive}
              className="transition-colors hover:opacity-95"
              style={{ backgroundColor: ctaColor, color: ctaForeground }}
            >
              {buttonLabel}
            </Button>
          )}
        </div>
      </div>

      <AgreementModalShell
        open={open}
        onOpenChange={setOpen}
        agreementTitle={modalAgreementTitle}
        jumpNavItems={jumpNavItems}
        onDownload={onDownload}
        scrollContainerRef={scrollRef}
        headerActions={
          accepted ? (
            <Badge variant="success" className="h-8 px-3 text-sm">
              Signed
            </Badge>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={scrollToSignSection}
              className="gap-1.5 hover:opacity-90"
              style={{ backgroundColor: ctaColor, color: ctaForeground }}
            >
              Accept
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          )
        }
      >
        {signedView ? (
          <SignedAgreementPrintBody signedView={signedView} afterTitle={buyerScreenAfterTitle} />
        ) : signedAgreementPending ? (
          <AgreementModalPendingBody />
        ) : (
          <AgreementModalPrintBody
            agreementTitle={modalAgreementTitle}
            legalHtml={modalLegalHtml}
            signatureSrc={accepted ? signatureDataUrl : null}
            signerName={accepted ? displayName : null}
            signerOrganization={accepted ? displayOrganization : null}
            signedAt={signedAtMs}
            showLegalSectionLabel
            companyPrintName={printFooterName}
            afterTitle={buyerScreenAfterTitle}
          />
        )}
        <section
          ref={signRef}
          id={AGREEMENT_SIGN_SECTION_ID}
          {...{ [AGREEMENT_PRINT_EXCLUDE_ATTR]: "" }}
          className="mt-16 print:hidden"
        >
          {accepted ? (
            <Card className="text-center shadow-sm">
              <CardContent className="flex flex-col items-center pt-8 sm:px-8">
                <span className="flex size-12 items-center justify-center rounded-full bg-green-100 text-green-800">
                  <CheckCircle2 className="size-6" aria-hidden />
                </span>
                <Typography variant="h2" className="mt-4 text-xl">
                  Agreement Signed
                </Typography>
                <Typography variant="muted" className="mt-2">
                  {displayName ? (
                    <>
                      Thank you, <span className="font-semibold text-foreground">{displayName}</span>.
                      Your signature has been recorded.
                    </>
                  ) : (
                    <>Thank you — your signature has been recorded.</>
                  )}
                </Typography>
                <Typography variant="muted" className="mt-2">
                  We&apos;ll follow up with next steps shortly.
                </Typography>
              </CardContent>
              <CardFooter className="flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={onDownload}
                  disabled={signedAgreementRequired && !signedView}
                >
                  <Download className="size-4" aria-hidden />
                  Download PDF
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              </CardFooter>
            </Card>
          ) : (
            <AgreementSignatureForm
              disabled={!interactive || !shareToken}
              busy={false}
              eSignaturesEnabled={eSignaturesEnabled}
              electronicSignatureDisclaimerEnabled={electronicSignatureDisclaimerEnabled}
              termsReadDisclaimerEnabled={termsReadDisclaimerEnabled}
              requireAcceptTerms={requireAcceptTerms}
              prefillSignerNameEnabled={Boolean(block.prefillSignerNameEnabled)}
              prefillSignerEmailEnabled={Boolean(block.prefillSignerEmailEnabled)}
              prefillSignerOrganizationEnabled={Boolean(block.prefillSignerOrganizationEnabled)}
              prefillSignerName={block.prefillSignerName}
              prefillSignerEmail={block.prefillSignerEmail}
              prefillSignerOrganization={block.prefillSignerOrganization}
              customerSignerPrefill={customerSignerPrefill}
              agreementTitle={modalAgreementTitle}
              ctaColor={ctaColor}
              ctaForeground={ctaForeground}
              localityTimeZone={localityTimeZone}
              shareToken={shareToken}
              publicSubscriptionUi={publicSubscriptionUi}
              stripePublishableKey={stripePublishableKey}
              paymentDetailsSectionEnabled={block.paymentDetailsSectionEnabled !== false}
              monthlyTotalMinor={subscriptionMonthly?.total}
              monthlyCurrency={subscriptionMonthly?.currency}
              error={error}
              onDismissError={() => setError(null)}
              onSubmit={onSign}
            />
          )}
        </section>
      </AgreementModalShell>
    </div>
  );
}
