"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  BUILDER_INSPECTOR_PANEL_WIDTH_CLASS,
  BUILDER_OUTLINE_PANEL_WIDTH_CLASS,
} from "@/lib/proposal/editor-canvas-layout";

export interface BuilderSidePanelProps {
  side: "left" | "right";
  label: string;
  open: boolean;
  children: React.ReactNode;
}

/**
 * In-flow builder side column. The grid track (see `builderDesktopGridColumnsClass`)
 * animates between 0 and the open width; the panel content keeps a fixed inner width
 * anchored to the canvas-side edge, so the collapsing cell clips it — a rigid slide
 * with no `position: fixed` overlay that could paint over the canvas.
 */
export function BuilderSidePanel({ side, label, open, children }: BuilderSidePanelProps) {
  const isLeft = side === "left";

  return (
    <div
      className="relative min-h-0 min-w-0 overflow-hidden"
      data-state={open ? "expanded" : "collapsed"}
      data-side={side}
    >
      <aside
        aria-label={label}
        // `inert` (not aria-hidden alone) so focus cannot remain inside the clipped panel.
        inert={!open}
        className={cn(
          "absolute inset-y-0 flex h-full min-h-0 flex-col overflow-hidden bg-background",
          isLeft ? "right-0" : "left-0",
          isLeft ? BUILDER_OUTLINE_PANEL_WIDTH_CLASS : BUILDER_INSPECTOR_PANEL_WIDTH_CLASS,
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 w-px bg-border",
            isLeft ? "right-0" : "left-0",
          )}
        />
        {children}
      </aside>
    </div>
  );
}
