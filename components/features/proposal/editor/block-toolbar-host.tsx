"use client";

import * as React from "react";

import type { BlockToolbarPlacement } from "@/lib/proposal/block-chrome";
import { cn } from "@/lib/utils";

/** Grace window sized to the mouse travel from row edge to a toolbar floating above it. */
const TOOLBAR_HIDE_DELAY_MS = 200;

export interface BlockToolbarHostProps {
  placement: BlockToolbarPlacement;
  /** Row-level signal (selected, or hovered when the block shows its toolbar on hover). */
  active: boolean;
  children: React.ReactNode;
}

/**
 * Mounts a block toolbar and owns the hover bridge: `inside-band` pins to the band
 * corner; `above-row` floats over the row with bottom padding that stays hoverable so
 * pointer travel from row to toolbar never drops it. After `active` falls, the toolbar
 * lingers briefly and stays mounted while the pointer is over it.
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
        // `above-row`: floats over the row's top edge; the bottom padding is a HOVERABLE
        // bridge covering the gap, so pointer travel row → toolbar never leaves the host.
        placement === "inside-band" ? "right-3 top-3" : "bottom-full right-0 pb-2 pt-0.5",
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
