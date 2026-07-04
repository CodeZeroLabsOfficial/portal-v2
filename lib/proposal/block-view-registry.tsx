"use client";

import * as React from "react";
import type { CatalogServicePickerOption } from "@/types/catalog-service";
import type {
  AccordionBlock,
  AgreementBlock,
  IconBlock,
  ImageBlock,
  PackagesBlock,
  ProposalBlock,
  ProposalContentBlock,
  ProposalPublicSelections,
  ProposalStatus,
  SplashBlock,
} from "@/types/proposal";
import { ChevronRight } from "lucide-react";
import { embedVideoSrc } from "@/components/proposal/embed-video";
import { AgreementBlockPublic } from "@/components/proposal/agreement-block-public";
import { PackagesBlockPublic } from "@/components/proposal/packages-block-public";
import { PricingBlockPublic } from "@/components/proposal/pricing-block-public";
import { ProposalAccordionExpandSurface } from "@/components/proposal/proposal-accordion-expand-surface";
import { ProposalIconBlockDisplay } from "@/components/proposal/proposal-icon-block-display";
import { ProposalSectionShell } from "@/components/proposal/proposal-section-shell";
import { ProposalSplashBlockCanvas } from "@/components/proposal/proposal-splash-block";
import { escapeHtml } from "@/lib/common/escape-html";
import { isPublicProposalPackageSelectionsLocked } from "@/lib/proposal/commerce/package-selection";
import { PROPOSAL_ACCORDION_LIGHT_SURFACE_CLASSES } from "@/lib/proposal/editor-surface-tokens";
import {
  PROPOSAL_DOCUMENT_BLOCK_INNER_PAD_CLASSES,
  PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES,
} from "@/lib/proposal/public/public-layout";
import { isProposalImagePlaceholderUrl } from "@/lib/proposal/media/image-placeholder";
import { isSectionBackgroundActive } from "@/lib/proposal/section-background";
import { splashShowsCompanyLogo } from "@/lib/proposal/splash-branding";
import {
  PROPOSAL_CAPTION_PLAIN_CLASS,
  PROPOSAL_CAPTION_RICH_DISPLAY_CLASS,
} from "@/lib/proposal/rich-text/inline-caption-rich-display";
import { PROPOSAL_INLINE_HEADING_RICH_DISPLAY_CLASS } from "@/lib/proposal/rich-text/inline-heading-rich-display";
import { sanitizeProposalHtml } from "@/lib/proposal/sanitize";
import type { ProposalPublicSubscriptionUi } from "@/server/proposal/public-proposal-subscription-ui";
import { cn } from "@/lib/utils";

const PROPOSAL_HEADER_PLAIN_TITLE_CLASS =
  "text-2xl font-semibold tracking-tight text-foreground md:text-3xl";

/** Full top-level block list — used by the agreement modal to summarise selections. */
export interface ProposalRenderContext {
  allBlocks: ProposalBlock[];
  brandingLogoUrl?: string;
  firstRootSplashBlockId?: string | null;
  proposalStatus?: ProposalStatus;
  acceptedByName?: string;
  acceptedSignatureDataUrl?: string;
  acceptedAt?: number;
  localityTimeZone?: string;
  publicSubscriptionUi?: ProposalPublicSubscriptionUi | null;
  customerSignerPrefill?: import("@/types/proposal").ProposalCustomerSignerPrefill | null;
  catalogServices?: readonly CatalogServicePickerOption[];
  stripePublishableKey?: string;
}

export interface ProposalBlockViewProps {
  block: ProposalBlock | ProposalContentBlock;
  shareToken?: string;
  publicSelections?: ProposalPublicSelections;
  viewportSectionBleed?: boolean;
  splashPublicPresentation?: "editor" | "nestedColumn" | "rootFullWidth";
  proposalContext?: ProposalRenderContext;
  renderBlock: (block: ProposalBlock | ProposalContentBlock) => React.ReactNode;
}

export type ProposalBlockViewRenderer = (props: ProposalBlockViewProps) => React.ReactNode;

function AccordionPublicView({ block }: { block: AccordionBlock }) {
  const accordionPanels = block.panels ?? [];
  const [openById, setOpenById] = React.useState<Record<string, boolean>>({});

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      {accordionPanels.map((p, panelIdx) => {
        const open = Boolean(openById[p.id]);
        const contentId = `proposal-accordion-${block.id}-${p.id}`;
        return (
          <div key={p.id} className="border-b border-border/60 last:border-b-0">
            <button
              type="button"
              className="flex w-full cursor-pointer list-none select-none items-center justify-between gap-4 px-4 py-4 text-left text-foreground sm:px-5"
              aria-expanded={open}
              aria-controls={contentId}
              onClick={() => setOpenById((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
            >
              {(p.titleHtml ?? "").trim() ? (
                <div
                  className={cn(PROPOSAL_CAPTION_RICH_DISPLAY_CLASS, "min-w-0 flex-1 text-left")}
                  dangerouslySetInnerHTML={{ __html: sanitizeProposalHtml(p.titleHtml!) }}
                />
              ) : (
                <span className={cn("min-w-0 flex-1 text-left", PROPOSAL_CAPTION_PLAIN_CLASS)}>
                  {p.title.trim() ? p.title : "Untitled panel"}
                </span>
              )}
              <ChevronRight
                className={cn(
                  "h-5 w-5 shrink-0 text-[#673AB7] transition-transform duration-200 ease-out",
                  open && "rotate-90",
                )}
                aria-hidden
              />
            </button>
            <ProposalAccordionExpandSurface
              open={open}
              motionKey={contentId}
              id={contentId}
              data-proposal-accordion-light-surface
              className={cn(
                "w-full border-t border-border/45 px-4 py-4 sm:px-5",
                PROPOSAL_ACCORDION_LIGHT_SURFACE_CLASSES,
                panelIdx === accordionPanels.length - 1 && "rounded-b-2xl",
              )}
            >
              {p.html?.trim() ? (
                <div
                  className={cn(
                    "proposal-rich-text max-w-none text-sm leading-relaxed text-zinc-900",
                    "[&_a]:text-cyan-700 [&_a]:underline",
                    "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0",
                  )}
                  dangerouslySetInnerHTML={{ __html: sanitizeProposalHtml(p.html) }}
                />
              ) : (
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-900">{p.body ?? ""}</div>
              )}
            </ProposalAccordionExpandSurface>
          </div>
        );
      })}
    </div>
  );
}

function renderSplashBlock({
  block,
  proposalContext,
}: ProposalBlockViewProps): React.ReactNode {
  const s = block as SplashBlock;
  const pub = s.html?.trim() ? s.html : s.body ? `<p>${escapeHtml(s.body)}</p>` : "<p></p>";
  const splashLogo =
    proposalContext?.brandingLogoUrl &&
    splashShowsCompanyLogo(s, proposalContext.brandingLogoUrl, proposalContext.firstRootSplashBlockId ?? null)
      ? proposalContext.brandingLogoUrl
      : null;
  const canvas = (
    <ProposalSplashBlockCanvas
      block={s}
      mode="public"
      publicHtml={pub}
      presentation="editor"
      logoUrl={splashLogo}
    />
  );
  return canvas;
}

function renderHeaderBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "header") return null;
  if (block.html?.trim()) {
    return (
      <div
        className={PROPOSAL_INLINE_HEADING_RICH_DISPLAY_CLASS}
        dangerouslySetInnerHTML={{ __html: sanitizeProposalHtml(block.html) }}
      />
    );
  }
  return (
    <h2 className={cn("scroll-mt-20", PROPOSAL_HEADER_PLAIN_TITLE_CLASS)}>
      {block.text}
    </h2>
  );
}

function renderTextBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "text") return null;
  const tb = block;
  const editorMinStyle =
    tb.editorMinHeightPx != null && Number.isFinite(tb.editorMinHeightPx)
      ? {
          minHeight: `${Math.min(2000, Math.max(48, Math.round(tb.editorMinHeightPx)))}px`,
        }
      : undefined;
  if (block.html?.trim()) {
    return (
      <div
        style={editorMinStyle}
        className={cn(
          "proposal-rich-text max-w-none text-sm leading-relaxed text-foreground",
          "[&_a]:text-primary [&_a]:underline",
          "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
          "[&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-semibold",
          "[&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-semibold",
          "[&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold",
          "[&_h4]:mt-4 [&_h4]:text-base [&_h4]:font-semibold",
          "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5",
        )}
        dangerouslySetInnerHTML={{ __html: sanitizeProposalHtml(block.html) }}
      />
    );
  }
  return (
    <div style={editorMinStyle} className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
      {block.body ?? ""}
    </div>
  );
}

function renderImageBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  const ib = block as ImageBlock;
  if (isProposalImagePlaceholderUrl(ib.url)) {
    return null;
  }
  const align = ib.align ?? "center";
  const figAlign = cn(
    "space-y-2",
    align === "left" && "mr-auto",
    align === "center" && "mx-auto",
    align === "right" && "ml-auto",
  );
  const href = ib.href?.trim();
  const imgEl = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ib.url} alt={ib.alt ?? ""} className="max-h-[min(70vh,520px)] w-full object-contain" />
    </>
  );
  return (
    <figure className={figAlign}>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block outline-none ring-offset-background transition-opacity hover:opacity-95 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {imgEl}
        </a>
      ) : (
        imgEl
      )}
      {ib.caption ? (
        <figcaption
          className={cn(
            "text-xs text-muted-foreground",
            align === "left" && "text-left",
            align === "center" && "text-center",
            align === "right" && "text-right",
          )}
        >
          {ib.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function renderVideoBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "video") return null;
  const emb = embedVideoSrc(block.url);
  if (emb) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border/60 bg-black/5",
          emb.kind === "youtube" || emb.kind === "vimeo" ? "aspect-video" : "",
        )}
      >
        <iframe
          title={block.title ?? "Video"}
          src={emb.src}
          className="h-full min-h-[200px] w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <a
      href={block.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      Open video link
    </a>
  );
}

function renderEmbedBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "embed") return null;
  const v = embedVideoSrc(block.url);
  if (v) {
    return (
      <div className="overflow-hidden rounded-xl border border-border/60 aspect-video">
        <iframe title={block.title ?? "Embed"} src={v.src} className="h-full w-full" allowFullScreen />
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-dashed border-border/80 p-6 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{block.title ?? "Embed"}</p>
      <a href={block.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-primary underline">
        {block.url}
      </a>
    </div>
  );
}

function renderPricingBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "pricing") return null;
  return <PricingBlockPublic block={block} />;
}

function renderPackagesBlock({
  block,
  shareToken,
  publicSelections,
  viewportSectionBleed,
  proposalContext,
}: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "packages") return null;
  const pb = block as PackagesBlock;
  const packagesInteractive =
    Boolean(shareToken) && !isPublicProposalPackageSelectionsLocked(proposalContext?.proposalStatus);
  const packagesInner = (
    <PackagesBlockPublic
      block={pb}
      shareToken={shareToken ?? ""}
      initialSelection={publicSelections?.[pb.id]}
      interactive={packagesInteractive}
    />
  );
  const backdropActive = isSectionBackgroundActive(pb.background);
  const body = (
    <div className={cn(PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES, PROPOSAL_DOCUMENT_BLOCK_INNER_PAD_CLASSES)}>
      {packagesInner}
    </div>
  );
  return (
    <ProposalSectionShell
      background={pb.background}
      variant="viewer"
      viewportBleed={Boolean(viewportSectionBleed)}
    >
      {backdropActive ? body : packagesInner}
    </ProposalSectionShell>
  );
}

function renderFormBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "form") return null;
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
      <p className="text-sm font-medium text-foreground">{block.submitLabel ?? "Information"}</p>
      <div className="mt-4 space-y-3">
        {(block.fields ?? []).map((f) => (
          <div key={f.id}>
            <label className="text-[12px] font-medium text-muted-foreground">
              {f.label}
              {f.required ? <span className="text-destructive"> *</span> : null}
            </label>
            {f.fieldType === "textarea" ? (
              <textarea
                disabled
                rows={3}
                className="mt-1 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
                placeholder="Collected when you accept"
              />
            ) : f.fieldType === "select" ? (
              <select disabled className="mt-1 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                {(f.options ?? ["Option"]).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                disabled
                type={f.fieldType === "email" ? "email" : "text"}
                className="mt-1 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
                placeholder="Collected when you accept"
              />
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Form responses can be finalized together with your acceptance below.
      </p>
    </div>
  );
}

function renderSignatureBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "signature") return null;
  return (
    <div className="rounded-xl border border-border/70 bg-muted/10 p-4">
      <p className="text-sm font-medium text-foreground">{block.title ?? "Authorization"}</p>
      {block.termsSummary ? (
        <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{block.termsSummary}</p>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">
        {block.signerLabel ?? "Signatory"} — use the acceptance section at the end of this page.
      </p>
    </div>
  );
}

function renderAgreementBlock({
  block,
  shareToken,
  publicSelections,
  viewportSectionBleed,
  splashPublicPresentation,
  proposalContext,
  renderBlock,
}: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "agreement") return null;
  const ab = block as AgreementBlock;
  const agreementInner = (
    <AgreementBlockPublic
      block={ab}
      allBlocks={proposalContext?.allBlocks ?? []}
      shareToken={shareToken}
      publicSelections={publicSelections}
      proposalStatus={proposalContext?.proposalStatus}
      acceptedByName={proposalContext?.acceptedByName}
      acceptedSignatureDataUrl={proposalContext?.acceptedSignatureDataUrl}
      acceptedAt={proposalContext?.acceptedAt}
      localityTimeZone={proposalContext?.localityTimeZone}
      interactive={Boolean(shareToken)}
      publicSubscriptionUi={proposalContext?.publicSubscriptionUi}
      customerSignerPrefill={proposalContext?.customerSignerPrefill}
      catalogServices={proposalContext?.catalogServices}
      stripePublishableKey={proposalContext?.stripePublishableKey}
      renderAgreementChild={(child) =>
        renderBlock(child)
      }
    />
  );
  const backdropActive = isSectionBackgroundActive(ab.background);
  const body = (
    <div className={cn(PROPOSAL_PUBLIC_INNER_COLUMN_CLASSES, PROPOSAL_DOCUMENT_BLOCK_INNER_PAD_CLASSES)}>
      {agreementInner}
    </div>
  );
  return (
    <ProposalSectionShell
      background={ab.background}
      variant="viewer"
      viewportBleed={Boolean(viewportSectionBleed)}
    >
      {backdropActive ? body : agreementInner}
    </ProposalSectionShell>
  );
}

function renderPaymentBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "payment") return null;
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-foreground">
      <p className="font-medium">{block.label ?? "Payment"}</p>
      <p className="mt-1 text-muted-foreground">Your team can connect Stripe to collect payment in a follow-up step.</p>
    </div>
  );
}

function renderAccordionBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "accordion") return null;
  return <AccordionPublicView block={block} />;
}

function renderIconBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "icon") return null;
  return <ProposalIconBlockDisplay block={block as IconBlock} />;
}

function renderDividerBlock(): React.ReactNode {
  return <hr className="border-border/80" />;
}

function renderSpacerBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "spacer") return null;
  const px =
    typeof block.heightPx === "number" && Number.isFinite(block.heightPx)
      ? Math.min(2400, Math.max(1, Math.round(block.heightPx)))
      : 40;
  return <div className="w-full shrink-0" style={{ height: px }} aria-hidden />;
}

/** Leaf and commerce block renderers used by the public proposal document viewer. */
export const PROPOSAL_BLOCK_VIEW_REGISTRY: Partial<Record<ProposalBlock["type"], ProposalBlockViewRenderer>> = {
  splash: renderSplashBlock,
  header: renderHeaderBlock,
  text: renderTextBlock,
  image: renderImageBlock,
  video: renderVideoBlock,
  embed: renderEmbedBlock,
  pricing: renderPricingBlock,
  packages: renderPackagesBlock,
  form: renderFormBlock,
  signature: renderSignatureBlock,
  agreement: renderAgreementBlock,
  payment: renderPaymentBlock,
  accordion: renderAccordionBlock,
  icon: renderIconBlock,
  divider: renderDividerBlock,
  spacer: renderSpacerBlock,
};

export function renderProposalBlockFromRegistry(props: ProposalBlockViewProps): React.ReactNode | undefined {
  const renderer = PROPOSAL_BLOCK_VIEW_REGISTRY[props.block.type as ProposalBlock["type"]];
  return renderer?.(props);
}

/** Editor-side block UI re-exports (batch 2) for builder chrome discovery. */
export { AccordionBlockEditor } from "@/components/proposal/accordion-block-editor";
export { ProposalBlockToolbar } from "@/components/proposal/proposal-block-toolbar";
export { ColumnsBlockLayoutControls } from "@/components/proposal/columns-block-layout-controls";
export { ProposalIconBlockEditorRow } from "@/components/proposal/proposal-icon-block-editor";
export { ProposalImageBlockEditor } from "@/components/proposal/proposal-image-block-editor";
export { ProposalRichText } from "@/components/proposal/proposal-rich-text";
export {
  PackagesInlineEditor,
  PricingInlineEditor,
} from "@/components/proposal/proposal-block-inline-editors";
export {
  ProposalSplashBackgroundPicker,
  SplashBlockInspector,
} from "@/components/proposal/proposal-splash-editor";
