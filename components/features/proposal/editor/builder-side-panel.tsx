"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/** Aligns fixed panels with builder canvas `scroll-pt-12` / sticky top bar clearance. */
export const BUILDER_SIDE_PANEL_TOP_CLASS = "top-12";

/** Matches `BuilderPanel` header row (`pt-6` below sticky top bar). */
export const BUILDER_SIDE_PANEL_TOGGLE_TOP_CLASS =
  "top-[calc(theme(spacing.12)+theme(spacing.6))]";

/** Fixed panel width — 20% / 60% / 20% builder columns when both open. */
export const BUILDER_SIDE_PANEL_WIDTH_CLASSES = "w-[20%]";

/** Off-screen slide distance (must match width). */
export const BUILDER_SIDE_PANEL_OFFSCREEN_LEFT_CLASS = "left-[calc(-20%)]";
export const BUILDER_SIDE_PANEL_OFFSCREEN_RIGHT_CLASS = "right-[calc(-20%)]";

const BUILDER_SIDE_PANEL_TRANSITION_CLASSES =
  "duration-200 ease-linear motion-reduce:transition-none";

export interface BuilderSidePanelProps {
  side: "left" | "right";
  label: string;
  open: boolean;
  children: React.ReactNode;
}

/** Fixed offcanvas side column — mirrors `Sidebar` gap + `left`/`right` slide transitions. */
export function BuilderSidePanel({ side, label, open, children }: BuilderSidePanelProps) {
  const isLeft = side === "left";

  return (
    <div
      className="group peer relative min-h-0 min-w-0 self-stretch overflow-hidden"
      data-state={open ? "expanded" : "collapsed"}
      data-side={side}
      data-collapsible="offcanvas"
    >
      <div
        aria-hidden
        className={cn(
          "relative h-full bg-transparent",
          BUILDER_SIDE_PANEL_TRANSITION_CLASSES,
          open ? "w-full" : "w-0",
        )}
      />
      <div
        className={cn(
          "fixed bottom-0 z-30 flex flex-col bg-background transition-[left,right] ease-linear",
          BUILDER_SIDE_PANEL_TRANSITION_CLASSES,
          BUILDER_SIDE_PANEL_TOP_CLASS,
          BUILDER_SIDE_PANEL_WIDTH_CLASSES,
          !open && "pointer-events-none",
          isLeft
            ? open
              ? "left-0"
              : BUILDER_SIDE_PANEL_OFFSCREEN_LEFT_CLASS
            : open
              ? "right-0"
              : BUILDER_SIDE_PANEL_OFFSCREEN_RIGHT_CLASS,
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 w-px bg-border",
            isLeft ? "right-0" : "left-0",
          )}
        />
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
