"use client";

import { embedVideoSrc } from "@/lib/proposal/media/embed-video";
import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";
import { cn } from "@/lib/utils";

export function renderVideoBlock({ block }: ProposalBlockViewProps): React.ReactNode {
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
