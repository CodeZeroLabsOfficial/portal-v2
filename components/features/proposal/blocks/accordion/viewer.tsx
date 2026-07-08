"use client";

import * as React from "react";
import type { AccordionBlock } from "@/types/proposal";
import { ChevronRight } from "lucide-react";
import { ProposalAccordionExpandSurface } from "@/components/features/proposal/blocks/shared/accordion-expand-surface";
import { ProposalRichTextHtml } from "@/components/shared/proposal-rich-text-html";
import { PROPOSAL_ACCORDION_LIGHT_SURFACE_CLASSES } from "@/lib/proposal/editor-surface-tokens";
import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";
import { PROPOSAL_CAPTION_PLAIN_CLASS } from "@/lib/proposal/rich-text/display-typography";
import { cn } from "@/lib/utils";

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
                <ProposalRichTextHtml
                  html={p.titleHtml!}
                  layout="caption"
                  className="min-w-0 flex-1 text-left"
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
                <ProposalRichTextHtml
                  html={p.html}
                  layout="body"
                  className="text-zinc-900 [&_a]:text-cyan-700"
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

export function renderAccordionBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "accordion") return null;
  return <AccordionPublicView block={block} />;
}
