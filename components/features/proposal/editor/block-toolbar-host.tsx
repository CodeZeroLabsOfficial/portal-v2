"use client";

import * as React from "react";

import type { BlockToolbarPlacement } from "@/lib/proposal/block-chrome";
import { cn } from "@/lib/utils";

/** Mirrors the section-child floating gutter so mouse travel to the toolbar never drops it. */
const TOOLBAR_HIDE_DELAY_MS = 160;

export interface BlockToolbarHostProps {
  placement: BlockToolbarPlacement;
  /** Row-level signal (selected, or hovered when the block shows its toolbar on hover). */
  active: boolean;
  children: React.ReactNode;
}

/**
 * Mounts a block toolbar inside its band or row (never above it) and owns the hover
 * bridge: after `active` drops, the toolbar lingers briefly and stays put while the
 * pointer is over it, so it remains interactive under mouse travel.
 */
export function BlockToolbarHost({ placement, active, children }: BlockToolbarHostProps) {
  const [visible, setVisible] = React.useState(active);
  const hoveredRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleHide = React.useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (!hoveredRef.current) setVisible(false);
    }, TOOLBAR_HIDE_DELAY_MS);
  }, [clearTimer]);

  React.useEffect(() => {
    if (active) {
      clearTimer();
      setVisible(true);
    } else {
      scheduleHide();
    }
    return clearTimer;
  }, [active, clearTimer, scheduleHide]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "absolute z-50",
        placement === "inside-band" ? "right-3 top-3" : "right-0 top-0 pb-1 pt-0.5",
      )}
      onMouseEnter={() => {
        hoveredRef.current = true;
        clearTimer();
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
        if (!active) scheduleHide();
      }}
      // Interacting with the toolbar must not bubble into row click/selection handlers.
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}
