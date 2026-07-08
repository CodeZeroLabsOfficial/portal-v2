"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/** Matches `BuilderPanel` header row (`pt-6` below sticky top bar). */
export const BUILDER_SIDE_PANEL_TOGGLE_TOP_CLASS =
  "top-[calc(theme(spacing.12)+theme(spacing.6))]";

/**
 * Stable width of the panel content. Matches the open 20% grid track (the grid container spans the
 * full viewport, so 20vw ≈ 20%). Keeping the content a fixed width — rather than `w-full` of the
 * animating cell — lets it slide/clip cleanly while the track collapses, instead of the form
 * reflowing as it narrows.
 */
const BUILDER_SIDE_PANEL_CONTENT_WIDTH_CLASS = "w-[20vw]";

export interface BuilderSidePanelProps {
  side: "left" | "right";
  label: string;
  open: boolean;
  children: React.ReactNode;
}

/**
 * In-flow builder side column. The panel lives in its grid track (width driven by
 * {@link builderDesktopGridTemplateColumns}), so opening it always displaces the canvas and it can
 * never overlay it. The content is anchored to the canvas-facing (seam) edge of the cell, so as the
 * track animates to `0px` the panel slides out toward the viewport edge and is clipped by the cell's
 * `overflow-hidden`. `inert` removes a collapsed panel from the tab order and the accessibility tree.
 */
export function BuilderSidePanel({ side, label, open, children }: BuilderSidePanelProps) {
  const isLeft = side === "left";

  return (
    <div
      className="relative min-h-0 min-w-0 self-stretch overflow-hidden"
      data-state={open ? "expanded" : "collapsed"}
      data-side={side}
      data-collapsible="offcanvas"
    >
      <aside
        aria-label={label}
        inert={!open}
        className={cn(
          "absolute inset-y-0 flex min-h-0 flex-col bg-background",
          BUILDER_SIDE_PANEL_CONTENT_WIDTH_CLASS,
          // Anchor to the seam (canvas-facing edge) so the panel slides outward as the track closes.
          isLeft ? "right-0 border-r border-border" : "left-0 border-l border-border",
        )}
      >
        {children}
      </aside>
    </div>
  );
}
