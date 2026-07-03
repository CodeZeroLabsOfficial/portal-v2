"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/** Aligns fixed panels with builder canvas `scroll-pt-12` / sticky top bar clearance. */
export const BUILDER_SIDE_PANEL_TOP_CLASS = "top-12";

/** Concrete width for gap + fixed panel (enables off-screen left/right calc like app sidebar). */
export const BUILDER_SIDE_PANEL_WIDTH_CLASSES = "w-[clamp(11rem,15vw,18rem)]";

/** Matches `BuilderPanel` header row (`pt-6` below sticky top bar). */
export const BUILDER_SIDE_PANEL_TOGGLE_TOP_CLASS =
  "top-[calc(theme(spacing.12)+theme(spacing.6))]";

/** Outline collapse / expand — inner (canvas) edge of the left column, inset like header `px-6`. */
export const BUILDER_OUTLINE_TOGGLE_LEFT_CLASS =
  "left-[calc(clamp(11rem,15vw,18rem)-theme(spacing.6)-theme(spacing.8))]";

/** Inspector collapse / expand — same inset as header `px-6`. */
export const BUILDER_INSPECTOR_TOGGLE_RIGHT_CLASS = "right-6";

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
      className="group peer relative min-h-0 shrink-0 self-stretch"
      data-state={open ? "expanded" : "collapsed"}
      data-side={side}
      data-collapsible="offcanvas"
    >
      <div
        aria-hidden
        className={cn(
          "relative h-full bg-transparent transition-[width] duration-200 ease-linear motion-reduce:transition-none",
          open ? BUILDER_SIDE_PANEL_WIDTH_CLASSES : "w-0 min-w-0 max-w-none",
        )}
      />
      <div
        className={cn(
          "fixed bottom-0 z-30 flex flex-col bg-background transition-[left,right] duration-200 ease-linear motion-reduce:transition-none",
          BUILDER_SIDE_PANEL_TOP_CLASS,
          BUILDER_SIDE_PANEL_WIDTH_CLASSES,
          !open && "pointer-events-none",
          isLeft
            ? open
              ? "left-0"
              : "left-[calc(-1*clamp(11rem,15vw,18rem))]"
            : open
              ? "right-0"
              : "right-[calc(-1*clamp(11rem,15vw,18rem))]",
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
