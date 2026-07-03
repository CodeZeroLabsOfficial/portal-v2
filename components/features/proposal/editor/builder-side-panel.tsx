"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export const BUILDER_SIDE_PANEL_WIDTH_CLASSES = "w-[15%] min-w-[11rem] max-w-[18rem]";

export interface BuilderSidePanelProps {
  side: "left" | "right";
  label: string;
  open: boolean;
  children: React.ReactNode;
}

/** Fixed-width offcanvas side column with portal-sidebar-style slide transitions. */
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
          "absolute inset-y-0 z-10 flex flex-col bg-background transition-[transform] duration-200 ease-linear motion-reduce:transition-none",
          BUILDER_SIDE_PANEL_WIDTH_CLASSES,
          isLeft
            ? cn("left-0", !open && "-translate-x-full pointer-events-none")
            : cn("right-0", !open && "translate-x-full pointer-events-none"),
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
          className="flex h-full min-h-0 w-full flex-col overflow-hidden"
        >
          {children}
        </aside>
      </div>
    </div>
  );
}
