"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/** Matches `BuilderPanel` header row (`pt-6` below sticky top bar) — reopen edge triggers. */
export const BUILDER_SIDE_PANEL_TOGGLE_TOP_CLASS =
  "top-[calc(theme(spacing.12)+theme(spacing.6))]";

/**
 * Panel content width. MUST stay in sync with the open builder grid track in
 * `builderDesktopGridColumns` (`20vw`): the content is pinned to the track's inner edge and
 * clipped by the collapsing cell, so an exact match means no gap or overlap against the canvas.
 */
export const BUILDER_SIDE_PANEL_WIDTH_CLASSES = "w-[20vw]";

export interface BuilderSidePanelProps {
  side: "left" | "right";
  label: string;
  open: boolean;
  children: React.ReactNode;
}

/**
 * In-flow offcanvas side column. The parent grid animates this cell's track between `20vw` and
 * `0px`, genuinely reflowing the canvas; `overflow-hidden` clips the fixed-width content so it
 * slides off the viewport edge instead of overlaying (and covering) the canvas. The shell owns a
 * definite height, so the cell never scrolls with the canvas — the panel body scrolls on its own.
 */
export function BuilderSidePanel({ side, label, open, children }: BuilderSidePanelProps) {
  const isLeft = side === "left";

  return (
    <div
      className="group peer relative min-h-0 min-w-0 self-stretch overflow-hidden"
      data-state={open ? "expanded" : "collapsed"}
      data-side={side}
      data-collapsible="offcanvas"
    >
      {/* Pinned to the canvas-facing edge so the outer (viewport) edge clips first as the track collapses. */}
      <div
        className={cn(
          "bg-background absolute inset-y-0 flex flex-col",
          BUILDER_SIDE_PANEL_WIDTH_CLASSES,
          isLeft ? "border-border right-0 border-r" : "border-border left-0 border-l",
          !open && "pointer-events-none",
        )}
      >
        <aside
          aria-label={label}
          aria-hidden={!open}
          className="flex h-full min-h-0 w-full flex-col overflow-hidden"
        >
          {children}
        </aside>
      </div>
    </div>
  );
}
