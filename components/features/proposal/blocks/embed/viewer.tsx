"use client";

import { embedVideoSrc } from "@/lib/proposal/media/embed-video";
import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";

export function renderEmbedBlock({ block }: ProposalBlockViewProps): React.ReactNode {
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
