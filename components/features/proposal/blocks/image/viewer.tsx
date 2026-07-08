"use client";

import type { ImageBlock } from "@/types/proposal";
import { isProposalImagePlaceholderUrl } from "@/lib/proposal/media/image-placeholder";
import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";
import { cn } from "@/lib/utils";

export function renderImageBlock({ block }: ProposalBlockViewProps): React.ReactNode {
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
