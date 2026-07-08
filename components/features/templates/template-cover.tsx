"use client";

import Image from "next/image";
import { LayoutTemplate } from "lucide-react";

import { ContractTemplateCoverTitlePage } from "@/components/features/templates/contract-template-cover-title-page";
import { ProposalTemplateCoverPreview } from "@/components/features/templates/proposal-template-cover-preview";
import type { TemplateHubKind } from "@/lib/templates/hub-rows";
import { cn } from "@/lib/utils";
import type { ProposalBlock, ProposalBranding } from "@/types/proposal";

export interface TemplateCoverProps {
  alt: string;
  kind: TemplateHubKind;
  className?: string;
  /** Proposal — first root block live preview. */
  coverPreviewBlocks?: ProposalBlock[];
  branding?: ProposalBranding;
  /** Proposal fallback when the document has no previewable blocks. */
  coverImageUrl?: string;
  /** Contract — agreement PDF page 1 title. */
  agreementTitle?: string;
}

function isNextImageRemoteUrl(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== "https:") return false;
    return (
      hostname === "firebasestorage.googleapis.com" ||
      hostname.endsWith(".googleusercontent.com")
    );
  } catch {
    return false;
  }
}

function TemplateCoverImageFallback({
  coverImageUrl,
  alt,
  className,
}: {
  coverImageUrl: string;
  alt: string;
  className?: string;
}) {
  return (
    <figure className={cn("relative aspect-video w-full overflow-hidden bg-muted", className)}>
      {isNextImageRemoteUrl(coverImageUrl) ? (
        <Image
          src={coverImageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- splash defaults and blob URLs may be external
        <img src={coverImageUrl} alt={alt} className="size-full object-cover" />
      )}
    </figure>
  );
}

function TemplateCoverPlaceholder({ kind, className }: { kind: TemplateHubKind; className?: string }) {
  return (
    <figure
      className={cn(
        "relative flex aspect-video w-full items-center justify-center overflow-hidden",
        kind === "proposal"
          ? "bg-gradient-to-br from-primary/10 via-muted to-muted"
          : "bg-gradient-to-br from-secondary/30 via-muted to-muted",
        className,
      )}
      aria-hidden
    >
      <LayoutTemplate className="text-muted-foreground size-10" />
    </figure>
  );
}

export function TemplateCover({
  alt,
  kind,
  className,
  coverPreviewBlocks,
  branding,
  coverImageUrl,
  agreementTitle,
}: TemplateCoverProps) {
  if (kind === "contract") {
    return (
      <figure className={cn("relative aspect-video w-full overflow-hidden", className)}>
        <ContractTemplateCoverTitlePage agreementTitle={agreementTitle ?? alt} className="absolute inset-0" />
      </figure>
    );
  }

  if (coverPreviewBlocks && coverPreviewBlocks.length > 0) {
    return (
      <ProposalTemplateCoverPreview
        blocks={coverPreviewBlocks}
        branding={branding}
        className={className}
      />
    );
  }

  if (coverImageUrl) {
    return <TemplateCoverImageFallback coverImageUrl={coverImageUrl} alt={alt} className={className} />;
  }

  return <TemplateCoverPlaceholder kind={kind} className={className} />;
}
