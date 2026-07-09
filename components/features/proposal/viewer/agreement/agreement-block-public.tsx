"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Download, Menu, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { readableForeground, resolveAgreementButtonColor } from "@/lib/proposal/block-style";
import type { CatalogServicePickerOption } from "@/types/catalog-service";
import { injectAgreementLegalHeadingIds } from "@/lib/agreement/legal-headings";
import { AGREEMENT_MODAL_LIGHT_SURFACE_CLASSES } from "@/lib/proposal/editor-surface-tokens";
import { PROPOSAL_EDITOR_SECTION_INNER_PAD_CLASSES } from "@/lib/proposal/public/public-layout";
import { AgreementDocumentIntro } from "@/components/features/proposal/agreement/agreement-document-intro";
import { AgreementPrintDocumentContent } from "@/components/features/proposal/agreement/agreement-print-document-content";
import {
  AgreementSelectionSection,
  NoPackageSelectionCard,
} from "@/components/features/proposal/agreement/agreement-selection-section";
import { defaultAgreementLegalNavItems } from "@/components/features/proposal/agreement/agreement-legal-content";
import { AgreementSectionLabel } from "@/components/features/proposal/agreement/agreement-section-label";
import {
  buildPackageSelectionSummary,
  packagesBlocksFromDocument,
} from "@/lib/proposal/agreement/package-selection-summary";
import type { PackageSelectionSummary } from "@/lib/proposal/agreement/package-selection-summary";
import {
  AGREEMENT_MODAL_HEADER_TITLE_CLASSES,
  AGREEMENT_NAV_CHILD_LINK_CLASSES,
  AGREEMENT_NAV_LINK_CLASSES,
} from "@/lib/proposal/agreement/chrome-typography";
import { AGREEMENT_PRINT_TARGET_SHELL_CLASSES } from "@/lib/proposal/agreement/print-layout";
import {
  AGREEMENT_PRINT_EXCLUDE_ATTR,
  printAgreementDocument,
  useAgreementPrintMode,
} from "@/hooks/use-agreement-print-mode";
import { isDocumentPackageSelectionComplete } from "@/lib/proposal/commerce/package-selection";
import type { ProposalPublicSubscriptionUi } from "@/server/proposal/public-proposal-subscription-ui";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  /** Captured e-signature image (data URL) after acceptance — used for print/PDF. */
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
  /** When false (editor / preview) the CTA is disabled and the sign form is read-only. */
  interactive?: boolean;
  /** Renders nested blocks above the sign button (same pipeline as the public document viewer). */
  renderAgreementChild: (child: ProposalAgreementChildBlock) => React.ReactNode;
}

const DEFAULT_BUTTON_LABEL = "View Agreement";
const DEFAULT_AGREEMENT_TITLE = "Services Agreement";
/** Small inset from the top of the modal scroll pane (header is outside this pane). */
const AGREEMENT_SCROLL_PADDING_PX = 12;

function scrollAgreementContainerToElement(
  container: HTMLElement,
  target: HTMLElement,
  behavior: ScrollBehavior = "smooth",
) {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const nextTop = targetRect.top - containerRect.top + container.scrollTop - AGREEMENT_SCROLL_PADDING_PX;
  container.scrollTo({ top: Math.max(0, nextTop), behavior });
}

type AgreementJumpLink = { kind: "link"; id: string; label: string };
type AgreementJumpGroup = {
  kind: "group";
  id: string;
  label: string;
  children: Array<{ id: string; label: string }>;
};
type AgreementJumpItem = AgreementJumpLink | AgreementJumpGroup;

export function AgreementBlockPublic({
  block,
  allBlocks,
  shareToken,
  publicSelections,
  proposalStatus,
  acceptedByName,
  acceptedSignatureDataUrl,
  acceptedAt,
  localityTimeZone,
  interactive = true,
  publicSubscriptionUi = null,
  customerSignerPrefill = null,
  catalogServices = [],
  stripePublishableKey,
  companyPrintName,
  renderAgreementChild,
}: AgreementBlockPublicProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [localAcceptedName, setLocalAcceptedName] = React.useState<string | null>(null);
  const [localSignatureDataUrl, setLocalSignatureDataUrl] = React.useState<string | null>(null);
  const [localDone, setLocalDone] = React.useState(proposalStatus === "accepted");

  React.useEffect(() => {
    setLocalDone(proposalStatus === "accepted");
  }, [proposalStatus]);

  const buttonLabel = block.buttonLabel?.trim() || DEFAULT_BUTTON_LABEL;
  const buttonAlign = block.buttonAlign ?? "center";
  const agreementTitle = block.agreementTitle?.trim() || DEFAULT_AGREEMENT_TITLE;
  const eSignaturesEnabled = block.eSignaturesEnabled !== false;
  const electronicSignatureDisclaimerEnabled = block.electronicSignatureDisclaimerEnabled !== false;
  const termsReadDisclaimerEnabled = block.termsReadDisclaimerEnabled !== false;
  const requireAcceptTerms = block.requireAcceptTerms !== false;
  const ctaColor = resolveAgreementButtonColor(block.style);
  const ctaForeground = readableForeground(ctaColor);

  const packageSummaries = React.useMemo(() => {
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
    if (packageSummaries.length === 0) return null;
    const total = packageSummaries.reduce((acc, s) => acc + s.monthlyTotalMinor, 0);
    const currency = packageSummaries[0]?.currency ?? "AUD";
    return { total, currency };
  }, [packageSummaries]);

  const accepted = localDone || proposalStatus === "accepted";
  const hasCustomLegal = Boolean(block.legalHtml?.trim());

  const introWithHeadingIds = React.useMemo(() => {
    if (!block.introHtml?.trim()) return { html: "", headings: [] };
    return injectAgreementLegalHeadingIds(block.introHtml.trim(), { idPrefix: "agreement-intro" });
  }, [block.introHtml]);

  const legalWithHeadingIds = React.useMemo(() => {
    if (!block.legalHtml?.trim()) return { html: "", headings: [] };
    return injectAgreementLegalHeadingIds(block.legalHtml.trim());
  }, [block.legalHtml]);

  const agreementLegalChildren = React.useMemo(() => {
    const intro = introWithHeadingIds.headings.map((h) => ({ id: h.id, label: h.label }));
    const legal = hasCustomLegal
      ? legalWithHeadingIds.headings.map((h) => ({ id: h.id, label: h.label }))
      : defaultAgreementLegalNavItems();
    return [...intro, ...legal];
  }, [hasCustomLegal, introWithHeadingIds.headings, legalWithHeadingIds.headings]);

  const jumpNavItems = React.useMemo((): AgreementJumpItem[] => {
    const items: AgreementJumpItem[] = [
      { kind: "link", id: "agreement-top", label: "Top of agreement" },
    ];
    if (packageSummaries.length > 0) {
      items.push({ kind: "link", id: "agreement-plan", label: "Selected plan & add-ons" });
    }
    items.push({
      kind: "group",
      id: "agreement-legal",
      label: agreementTitle,
      children: agreementLegalChildren,
    });
    items.push({
      kind: "link",
      id: "agreement-sign",
      label: accepted ? "Signature" : "Sign agreement",
    });
    return items;
  }, [packageSummaries.length, agreementTitle, agreementLegalChildren, accepted]);
  const displayName = localAcceptedName ?? acceptedByName;
  const signatureDataUrl = localSignatureDataUrl ?? acceptedSignatureDataUrl ?? null;
  const signedAtMs = accepted ? (acceptedAt ?? null) : null;
  const blockAgreementUntilPlanPicked = interactive && !accepted && !planSelectionComplete;
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const signRef = React.useRef<HTMLDivElement | null>(null);
  const [sectionsSidebarOpen, setSectionsSidebarOpen] = React.useState(false);

  useAgreementPrintMode();

  React.useEffect(() => {
    if (!open) setSectionsSidebarOpen(false);
  }, [open]);

  function jumpToSection(id: string) {
    const container = scrollRef.current;
    if (!container) return;
    const el = container.querySelector(`#${CSS.escape(id)}`);
    if (el instanceof HTMLElement) {
      scrollAgreementContainerToElement(container, el);
    }
  }

  function scrollToRef(ref: React.RefObject<HTMLDivElement | null>) {
    const container = scrollRef.current;
    const el = ref.current;
    if (container && el) {
      scrollAgreementContainerToElement(container, el);
    }
  }

  function onDownload() {
    printAgreementDocument({ documentTitle: agreementTitle });
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          onEscapeKeyDown={(e) => {
            if (sectionsSidebarOpen) {
              e.preventDefault();
              setSectionsSidebarOpen(false);
            }
          }}
          className={cn(
            AGREEMENT_MODAL_LIGHT_SURFACE_CLASSES,
            "z-50 grid gap-0 overflow-hidden border-0 p-0 shadow-2xl",
            // Mobile: fills viewport, no rounding.
            "h-[100dvh] w-screen max-w-none left-0 top-0 translate-x-0 translate-y-0 rounded-none",
            // Desktop: near-full-screen with subtle rounding to match Qwilr's modal proportions.
            "sm:left-1/2 sm:top-1/2 sm:h-[min(96dvh,960px)] sm:max-h-[96dvh]",
            "sm:w-[min(1536px,calc(100vw-3rem))] sm:max-w-[min(1536px,calc(100vw-3rem))]",
            "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
            "print:static print:inset-auto print:h-auto print:max-h-none print:w-full print:max-w-none",
            "print:translate-x-0 print:translate-y-0 print:rounded-none print:shadow-none print:overflow-visible",
            "grid-rows-[auto,1fr] print:grid-rows-1",
            "pt-[max(0px,env(safe-area-inset-top))] sm:pt-0",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 print:hidden">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={sectionsSidebarOpen ? "Close agreement sections" : "Open agreement sections"}
                aria-expanded={sectionsSidebarOpen}
                aria-controls="agreement-sections-sidebar"
                onClick={() => setSectionsSidebarOpen((v) => !v)}
              >
                <Menu className="size-5" aria-hidden />
              </Button>
              <DialogTitle className={AGREEMENT_MODAL_HEADER_TITLE_CLASSES}>
                {agreementTitle}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="aspect-square max-sm:p-0"
              >
                <Download aria-hidden className="opacity-60 sm:-ms-1" size={16} />
                <span className="max-sm:sr-only">Download</span>
              </Button>
              {accepted ? (
                <Badge variant="success" className="h-8 px-3 text-sm">
                  Signed
                </Badge>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => scrollToRef(signRef)}
                  className="gap-1.5 hover:opacity-90"
                  style={{ backgroundColor: ctaColor, color: ctaForeground }}
                >
                  Accept
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Close agreement">
                  <X className="size-5" aria-hidden />
                </Button>
              </DialogClose>
            </div>
          </div>

          <div className="flex h-full min-h-0 flex-1 overflow-hidden print:block print:h-auto print:min-h-0 print:overflow-visible">
            <aside
              id="agreement-sections-sidebar"
              aria-hidden={!sectionsSidebarOpen}
              inert={!sectionsSidebarOpen ? true : undefined}
              className={cn(
                "flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r motion-reduce:transition-none print:hidden",
                "transition-[width] duration-300 ease-out",
                sectionsSidebarOpen
                  ? "w-[min(18rem,88vw)] border-border shadow-[4px_0_16px_-8px_rgba(0,0,0,0.08)]"
                  : "w-0 border-transparent",
              )}
            >
              <div className="flex h-full min-h-0 w-[min(18rem,88vw)] flex-col">
                <div className="shrink-0 border-b px-4 py-3">
                  <AgreementSectionLabel>Jump to</AgreementSectionLabel>
                </div>
                <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Agreement sections">
                  <ul className="space-y-0.5">
                    {jumpNavItems.map((item) =>
                      item.kind === "link" ? (
                        <li key={item.id}>
                          <Button
                            type="button"
                            variant="ghost"
                            className={AGREEMENT_NAV_LINK_CLASSES}
                            onClick={() => jumpToSection(item.id)}
                          >
                            {item.label}
                          </Button>
                        </li>
                      ) : (
                        <li key={item.id}>
                          <Button
                            type="button"
                            variant="ghost"
                            className={AGREEMENT_NAV_LINK_CLASSES}
                            onClick={() => jumpToSection(item.id)}
                          >
                            {item.label}
                          </Button>
                          {item.children.length > 0 ? (
                            <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-border pl-1">
                              {item.children.map((child) => (
                                <li key={child.id}>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className={AGREEMENT_NAV_CHILD_LINK_CLASSES}
                                    onClick={() => jumpToSection(child.id)}
                                  >
                                    {child.label}
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      ),
                    )}
                  </ul>
                </nav>
              </div>
            </aside>

            <div
              ref={scrollRef}
              className="min-h-0 min-w-0 flex-1 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))] print:overflow-visible print:pb-0"
            >
            <div
              data-agreement-print-target=""
              className={AGREEMENT_PRINT_TARGET_SHELL_CLASSES}
            >
              <div id="agreement-top" aria-hidden />

              <AgreementPrintDocumentContent
                agreementTitle={agreementTitle}
                companyPrintName={companyPrintName}
                legalHtml={legalWithHeadingIds.html}
                signatureSrc={accepted ? signatureDataUrl : null}
                signerName={accepted ? displayName : null}
                signedAt={signedAtMs}
                showLegalSectionLabel
                afterTitle={
                  <>
                    <div {...{ [AGREEMENT_PRINT_EXCLUDE_ATTR]: "" }} className="print:hidden">
                      <AgreementDocumentIntro introHtml={introWithHeadingIds.html} />
                    </div>
                    <AgreementSelectionSection summaries={packageSummaries} />
                    {!packageSummaries.length && !block.legalHtml?.trim() ? (
                      <NoPackageSelectionCard />
                    ) : null}
                  </>
                }
              />

              <section
                ref={signRef}
                id="agreement-sign"
                data-agreement-print-exclude=""
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
                      <Button type="button" variant="outline" className="gap-2" onClick={onDownload}>
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
                    agreementTitle={agreementTitle}
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
            </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

