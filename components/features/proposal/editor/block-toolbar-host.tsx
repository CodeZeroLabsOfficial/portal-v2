"use client";

import * as React from "react";

import type { ToolbarPlacement, ToolbarVisibility } from "@/lib/proposal/block-chrome";
import { cn } from "@/lib/utils";

/** Grace period so the pointer can travel from the row into the toolbar without it vanishing. */
const TOOLBAR_HIDE_DELAY_MS = 160;

export interface BlockToolbarHostProps {
  placement: ToolbarPlacement;
  visibility: ToolbarVisibility;
  selected: boolean;
  rowHovered: boolean;
  /** Hide the toolbar entirely (e.g. while editing a nested column cell). */
  suppressed?: boolean;
  children: React.ReactNode;
}

/**
 * Mounts a block's floating toolbar inside the block's own relative box (never above the
 * canvas). Owns a hover bridge: the whole toolbar is interactive and lingers briefly after
 * the pointer leaves the row so it can be reached without a dead zone.
 */
export function BlockToolbarHost({
  placement,
  visibility,
  selected,
  rowHovered,
  suppressed = false,
  children,
}: BlockToolbarHostProps) {
  const [toolbarHovered, setToolbarHovered] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const active =
    !suppressed &&
    (selected || (visibility === "hover-or-selected" && (rowHovered || toolbarHovered)));

  const clearHideTimer = React.useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (active) {
      clearHideTimer();
      setVisible(true);
      return;
    }
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => setVisible(false), TOOLBAR_HIDE_DELAY_MS);
    return clearHideTimer;
  }, [active, clearHideTimer]);

  React.useEffect(() => clearHideTimer, [clearHideTimer]);

  if (!visible) return null;

  const positionClasses =
    placement === "inside-band" ? "right-3 top-3 z-40" : "right-1 top-1 z-50";

  return (
    <div
      className={cn("absolute", positionClasses)}
      onMouseEnter={() => setToolbarHovered(true)}
      onMouseLeave={() => setToolbarHovered(false)}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}
