"use client";

import * as React from "react";

import { ProposalDocumentView } from "@/components/features/proposal/viewer/proposal-document-view";
import { PROPOSAL_PUBLIC_DOCUMENT_OUTER_CLASSES } from "@/lib/proposal/public/public-layout";
import { cn } from "@/lib/utils";
import type { ProposalBlock, ProposalBranding } from "@/types/proposal";

const PREVIEW_SOURCE_WIDTH_PX = 1280;

export interface ProposalTemplateCoverPreviewProps {
  blocks: ProposalBlock[];
  branding?: ProposalBranding;
  className?: string;
}

/** Scaled live preview of the first proposal block for hub cards. */
export function ProposalTemplateCoverPreview({
  blocks,
  branding,
  className,
}: ProposalTemplateCoverPreviewProps) {
  const containerRef = React.useRef<HTMLElement>(null);
  const [scale, setScale] = React.useState(0.25);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setScale(width / PREVIEW_SOURCE_WIDTH_PX);
      }
    };

    updateScale();

    const ro = new ResizeObserver(updateScale);
    ro.observe(el);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(el);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <figure
      ref={containerRef}
      className={cn("relative aspect-video w-full overflow-hidden bg-muted", className)}
    >
      {isVisible ? (
        <div
          className="pointer-events-none absolute left-0 top-0 origin-top-left bg-background"
          style={{
            width: PREVIEW_SOURCE_WIDTH_PX,
            transform: `scale(${scale})`,
          }}
        >
          <div className={PROPOSAL_PUBLIC_DOCUMENT_OUTER_CLASSES}>
            <ProposalDocumentView
              document={{ title: "", blocks }}
              branding={branding}
              flushTop
            />
          </div>
        </div>
      ) : null}
    </figure>
  );
}
