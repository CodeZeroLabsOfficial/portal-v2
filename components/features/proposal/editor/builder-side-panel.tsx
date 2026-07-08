"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/** Matches `BuilderPanel` header row (`pt-6` below sticky top bar). */
export const BUILDER_SIDE_PANEL_TOGGLE_TOP_CLASS =
  "top-[calc(theme(spacing.12)+theme(spacing.6))]";

/**
 * Fixed width of the panel content. Matches the 20% grid track (the grid container spans the
 * full viewport, so 20vw ≈ 20%); pinning to a stable width lets the content clip cleanly while
 * the grid track animates to 0 instead of reflowing the form as it collapses.
 */
const BUILDER_SIDE_PANEL_CONTENT_WIDTH_CLASS = "w-[20vw]";

export interface BuilderSidePanelProps {
  side: "left" | "right";
  label: string;
  open: boolean;
  children: React.ReactNode;
}

/**
 * In-flow builder side column. The panel occupies its grid track (width driven by
 * {@link builderDesktopGridColumns}), so it always displaces the canvas and can never overlay it.
 * Collapsing animates the track to `0px`; `overflow-hidden` clips the fixed-width content, and
 * `inert` removes the hidden panel from the tab order and the accessibility tree.
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
          isLeft ? "left-0 border-r border-border" : "right-0 border-l border-border",
        )}
      >
        {children}
      </aside>
    </div>
  );
}
