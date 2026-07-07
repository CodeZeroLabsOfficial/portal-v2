"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { withAlpha } from "@/lib/proposal/block-style";
import {
  resolveSectionBackground,
  sectionPrefersLightForeground,
  type ResolvedSectionBackground,
} from "@/lib/proposal/section-background";
import type { SectionBackground } from "@/types/proposal";
import {
  PROPOSAL_CANVAS_SURFACE_DARK_CLASSES,
  PROPOSAL_CANVAS_SURFACE_LIGHT_CLASSES,
  PROPOSAL_SECTION_DARK_ACCORDION_LIGHT_SURFACE_OVERRIDES,
} from "@/lib/proposal/editor-surface-tokens";
import { PROPOSAL_EDITOR_BLOCK_CANVAS_INNER_CLASSES } from "@/lib/proposal/public/public-layout";
import { ProposalSectionEditorChromeContext } from "@/components/proposal/proposal-section-editor-chrome";

/** Backdrop visuals shared by proposal preview and proposal editor canvases. */
export function ProposalSectionShell({
  background,
  variant = "viewer",
  viewportBleed = false,
  children,
}: {
  background?: SectionBackground;
  variant?: "viewer" | "editor";
  /** Public viewer edge-to-edge band; horizontal padding stays on constrained inner children */
  viewportBleed?: boolean;
  children: React.ReactNode;
}) {
  const resolved = resolveSectionBackground(background);

  if (!resolved.active) {
    return children;
  }

  const prefersLight = sectionPrefersLightForeground(resolved);
  const viewerEdge = viewportBleed && variant === "viewer";
  const editorCanvas = variant === "editor";
  const shellRadius = editorCanvas
    ? "rounded-none"
    : viewerEdge
      ? "rounded-none"
      : cn("rounded-3xl md:rounded-[1.85rem]");
  const gutter =
    editorCanvas
      ? "py-0"
      : viewerEdge
        ? /* Vertical rhythm: section inner column padding in `ProposalDocumentView` (no inter-block margins). */
          "px-0 py-0"
        : cn("px-6 py-10 sm:px-10 sm:py-14 md:px-14 md:py-16");
  const surfaceChrome = editorCanvas
    ? "rounded-none shadow-none ring-0"
    : viewerEdge
      ? "shadow-none ring-0"
      : prefersLight
        ? "shadow-lg ring-1 ring-black/[0.08] dark:ring-white/10"
        : "shadow-[0_2px_32px_-10px_rgba(15,23,42,0.12)] ring-1 ring-zinc-950/[0.06]";

  /** Always flush with the backdrop — nested “content card” fills fought the chosen section colour. */
  const inner = children;

  const shellInner = (
    <div
      {...(editorCanvas ? { "data-proposal-section-editor": "" } : {})}
      className={cn(
        "proposal-section-shell relative isolate w-full min-w-0",
        editorCanvas ? "min-h-0 overflow-visible" : "min-h-[220px] overflow-hidden",
        surfaceChrome,
        shellRadius,
        !prefersLight && PROPOSAL_CANVAS_SURFACE_LIGHT_CLASSES,
        prefersLight &&
          cn(
            PROPOSAL_CANVAS_SURFACE_DARK_CLASSES,
            "text-white [&_h2]:!text-white",
            "[&_.proposal-rich-text]:!text-white/[0.9] [&_.proposal-rich-text_a]:text-sky-200 [&_.proposal-rich-text_a]:underline-offset-4",
            "[&_.text-muted-foreground]:text-white/72",
            // Tier/add-on cards stay white; restore dark copy inside each card only.
            "[&_.bg-card]:[--foreground:var(--base-800)]",
            "[&_.bg-card]:[--muted-foreground:var(--color-neutral-500)]",
            "[&_.bg-card]:[--border:var(--base-200)]",
            PROPOSAL_SECTION_DARK_ACCORDION_LIGHT_SURFACE_OVERRIDES,
          ),
      )}
    >
      <SectionBackdropLayers resolved={resolved} />

      <div className={cn("relative z-10", gutter)}>
        {editorCanvas ? (
          <div className={PROPOSAL_EDITOR_BLOCK_CANVAS_INNER_CLASSES}>{inner}</div>
        ) : (
          inner
        )}
      </div>
    </div>
  );

  if (editorCanvas) {
    return (
      <ProposalSectionEditorChromeContext.Provider
        value={{ seamless: true, appearance: prefersLight ? "elevated" : "surface" }}
      >
        {shellInner}
      </ProposalSectionEditorChromeContext.Provider>
    );
  }

  return shellInner;
}

function SectionBackdropLayers({ resolved }: { resolved: ResolvedSectionBackground }) {
  const blurPx = resolved.blurStrength;
  const filter = blurPx > 0 ? `blur(${blurPx}px)` : undefined;
  const scale = blurPx > 0 ? 1.1 : undefined;

  const showTint = resolved.kind !== "color";
  const tintAlpha = resolved.tintOpacityPct / 100;
  const tintFill = showTint
    ? resolved.tintStyle === "blend"
      ? ({
          mixBlendMode: "soft-light" as const,
          backgroundColor: withAlpha(resolved.tintColorHex, Math.min(1, tintAlpha * 1.2)),
        })
      : { backgroundColor: withAlpha(resolved.tintColorHex, tintAlpha) }
    : undefined;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-neutral-950">
      {/* Media */}
      <div
        className="absolute inset-0"
        style={{ filter, transform: scale ? `scale(${scale})` : undefined }}
      >
        {resolved.kind === "color" ? (
          <div className="h-full w-full" style={{ backgroundColor: resolved.colorHex }} />
        ) : resolved.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolved.mediaUrl}
            alt=""
            className="h-full w-full max-w-none select-none object-cover"
            draggable={false}
          />
        ) : resolved.posterUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- mobile still image */}
            <img
              src={resolved.posterUrl}
              alt=""
              className="h-full w-full max-w-none select-none object-cover md:hidden"
              draggable={false}
            />
            <video
              key={resolved.mediaUrl}
              className="hidden h-full w-full object-cover md:block"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={resolved.posterUrl}
              src={resolved.mediaUrl || undefined}
            />
          </>
        ) : (
          <video
            key={resolved.mediaUrl}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            src={resolved.mediaUrl || undefined}
          />
        )}
      </div>

      {showTint && tintFill ? (
        <div className={cn("absolute inset-0", resolved.tintStyle === "blend" && "isolate")}>
          <div className={cn("absolute inset-0", resolved.tintStyle === "blend" && "isolate")} style={tintFill} />
        </div>
      ) : null}
    </div>
  );
}
