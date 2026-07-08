"use client";

import * as React from "react";
import type { CatalogServicePickerOption } from "@/types/catalog-service";
import type {
  AgreementBlock,
  PackagesBlock,
  ProposalBlock,
  ProposalBranding,
  ProposalContentBlock,
  ProposalCustomerSignerPrefill,
  ProposalDocument,
  ProposalPublicSelections,
  ProposalStatus,
} from "@/types/proposal";
import {
  PROPOSAL_DOCUMENT_BLOCK_INNER_PAD_CLASSES,
  PROPOSAL_DOCUMENT_ROOT_STACK_GAP_CLASSES,
  PROPOSAL_EDITOR_SECTION_INNER_PAD_BOTTOM_CLASSES,
  PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES,
  PROPOSAL_PUBLIC_LOGO_BAND_CLASSES,
  PROPOSAL_PUBLIC_LOGO_IMAGE_CLASSES,
} from "@/lib/proposal/public/public-layout";
import { firstRootSplashBlockId, proposalEndsInFullBleedBand } from "@/lib/proposal/blocks";
import { renderProposalBlockFromRegistry } from "@/components/features/proposal/blocks/block-editor-registry";
import type { ProposalRenderContext } from "@/lib/proposal/block-view-types";
import { isSectionBackgroundActive } from "@/lib/proposal/section-background";
import { cn } from "@/lib/utils";

export type { ProposalRenderContext };

export interface ProposalDocumentViewProps {
  document: ProposalDocument;
  branding?: ProposalBranding;
  className?: string;
  /** Public share link only — enables saving package selection. */
  shareToken?: string;
  publicSelections?: ProposalPublicSelections;
  /** When true, root `section` bands span the full width of `<main>`; copy stays in the inner column */
  viewportSectionBleed?: boolean;
  /** Proposal lifecycle status, surfaced to the agreement block so it can render an accepted state. */
  proposalStatus?: ProposalStatus;
  /** Name of the buyer that already signed the agreement (when status is `accepted`). */
  acceptedByName?: string;
  /** E-signature image (data URL) stored on the proposal when accepted. */
  acceptedSignatureDataUrl?: string;
  acceptedAt?: number;
  /** IANA zone from Settings → Locality — agreement dates and previews use this when set. */
  localityTimeZone?: string;
  /** Prefilled subscription summary for the agreement success flow (public page only). */
  publicSubscriptionUi?: import("@/server/proposal/public-proposal-subscription-ui").ProposalPublicSubscriptionUi | null;
  /** CRM customer name / email / company for agreement field prefill (public page when `customerId` is set). */
  customerSignerPrefill?: ProposalCustomerSignerPrefill | null;
  /** Active catalogue — recurring vs one-off add-on labels in the agreement summary. */
  catalogServices?: readonly CatalogServicePickerOption[];
  stripePublishableKey?: string;
  /** In-editor live preview — first section band sits flush under the preview frame. */
  flushTop?: boolean;
}

function BlockView({
  block,
  shareToken,
  publicSelections,
  viewportSectionBleed,
  splashPublicPresentation,
  proposalContext,
  sectionInnerPadClasses,
}: {
  block: ProposalBlock | ProposalContentBlock;
  shareToken?: string;
  publicSelections?: ProposalPublicSelections;
  viewportSectionBleed?: boolean;
  splashPublicPresentation?: "editor" | "nestedColumn" | "rootFullWidth";
  proposalContext?: ProposalRenderContext;
  sectionInnerPadClasses?: string;
}) {
  const renderBlock = (child: ProposalBlock | ProposalContentBlock) => (
    <BlockView
      key={child.id}
      block={child}
      shareToken={shareToken}
      publicSelections={publicSelections}
      viewportSectionBleed={viewportSectionBleed}
      splashPublicPresentation={
        viewportSectionBleed && child.type === "splash" ? "nestedColumn" : splashPublicPresentation
      }
      proposalContext={proposalContext}
      sectionInnerPadClasses={sectionInnerPadClasses}
    />
  );

  const registryNode = renderProposalBlockFromRegistry({
    block,
    shareToken,
    publicSelections,
    viewportSectionBleed,
    splashPublicPresentation,
    proposalContext,
    renderBlock,
    sectionInnerPadClasses,
  });
  return registryNode ?? null;
}

export function ProposalDocumentView({
  document,
  branding,
  className,
  shareToken,
  publicSelections,
  viewportSectionBleed = true,
  proposalStatus,
  acceptedByName,
  acceptedSignatureDataUrl,
  acceptedAt,
  localityTimeZone,
  publicSubscriptionUi = null,
  customerSignerPrefill = null,
  catalogServices = [],
  stripePublishableKey,
  flushTop = false,
}: ProposalDocumentViewProps) {
  const style = React.useMemo(() => {
    if (!branding?.primaryColor && !branding?.fontFamily) return undefined;
    return {
      ...(branding?.primaryColor
        ? ({ ["--proposal-primary" as string]: branding.primaryColor } as React.CSSProperties)
        : {}),
      fontFamily: branding?.fontFamily,
    } as React.CSSProperties;
  }, [branding]);

  const splashLogoBlockId = React.useMemo(
    () => (branding?.logoUrl?.trim() && viewportSectionBleed ? firstRootSplashBlockId(document.blocks) : null),
    [branding?.logoUrl, document.blocks, viewportSectionBleed],
  );

  const showDocumentLevelLogo = Boolean(branding?.logoUrl?.trim() && !splashLogoBlockId);

  const proposalContext = React.useMemo<ProposalRenderContext>(
    () => ({
      allBlocks: document.blocks,
      brandingLogoUrl: branding?.logoUrl?.trim() || undefined,
      firstRootSplashBlockId: splashLogoBlockId,
      proposalStatus,
      acceptedByName,
      acceptedSignatureDataUrl,
      acceptedAt,
      localityTimeZone,
      publicSubscriptionUi,
      customerSignerPrefill,
      catalogServices,
      stripePublishableKey,
    }),
    [
      document.blocks,
      branding?.logoUrl,
      splashLogoBlockId,
      proposalStatus,
      acceptedByName,
      acceptedSignatureDataUrl,
      acceptedAt,
      localityTimeZone,
      publicSubscriptionUi,
      customerSignerPrefill,
      catalogServices,
      stripePublishableKey,
    ],
  );

  const flushBottom = proposalEndsInFullBleedBand(document.blocks);
  const rootStackClasses = flushBottom
    ? "flex flex-col gap-0"
    : PROPOSAL_DOCUMENT_ROOT_STACK_GAP_CLASSES;

  return (
    <article style={style} className={cn("w-full space-y-0", className)}>
      {showDocumentLevelLogo ? (
        <div className={PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES}>
          <div className={PROPOSAL_PUBLIC_LOGO_BAND_CLASSES}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={branding!.logoUrl} alt="" className={PROPOSAL_PUBLIC_LOGO_IMAGE_CLASSES} />
          </div>
        </div>
      ) : null}
      {viewportSectionBleed ? (
        <div className={cn("w-full", rootStackClasses)}>
          {document.blocks.map((block, blockIndex) => {
            const flushFirstSectionTop =
              flushTop && blockIndex === 0 && block.type === "section";
            const sectionInnerPadClasses = flushFirstSectionTop
              ? PROPOSAL_EDITOR_SECTION_INNER_PAD_BOTTOM_CLASSES
              : undefined;
            const splashRootBand = Boolean(viewportSectionBleed && block.type === "splash");
            const packagesRootBand = Boolean(
              viewportSectionBleed &&
                block.type === "packages" &&
                isSectionBackgroundActive((block as PackagesBlock).background),
            );
            const agreementRootBand = Boolean(
              viewportSectionBleed &&
                block.type === "agreement" &&
                isSectionBackgroundActive((block as AgreementBlock).background),
            );
            const child = (
              <BlockView
                block={block}
                shareToken={shareToken}
                publicSelections={publicSelections}
                viewportSectionBleed={viewportSectionBleed}
                splashPublicPresentation={
                  block.type === "splash"
                    ? viewportSectionBleed
                      ? "rootFullWidth"
                      : "nestedColumn"
                    : undefined
                }
                proposalContext={proposalContext}
                sectionInnerPadClasses={sectionInnerPadClasses}
              />
            );
            if (block.type === "section" || splashRootBand || packagesRootBand || agreementRootBand) {
              return (
                <section key={block.id} className="w-full shrink-0">
                  {child}
                </section>
              );
            }
            return (
              <section
                key={block.id}
                className={cn(
                  PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES,
                  PROPOSAL_DOCUMENT_BLOCK_INNER_PAD_CLASSES,
                  "shrink-0",
                )}
              >
                {child}
              </section>
            );
          })}
        </div>
      ) : (
        <div className={cn(PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES, rootStackClasses)}>
          {document.blocks.map((block) => (
            <section
              key={block.id}
              className={cn(
                "space-y-0",
                block.type !== "section" && PROPOSAL_DOCUMENT_BLOCK_INNER_PAD_CLASSES,
              )}
            >
              <BlockView
                block={block}
                shareToken={shareToken}
                publicSelections={publicSelections}
                viewportSectionBleed={false}
                splashPublicPresentation={block.type === "splash" ? "nestedColumn" : undefined}
                proposalContext={proposalContext}
              />
            </section>
          ))}
        </div>
      )}
    </article>
  );
}
