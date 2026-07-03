"use client";

import * as React from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";

import {
  SectionChildBlockGutter,
  SectionChildDragHandle,
} from "@/components/proposal/proposal-section-child-chrome";
import { cn } from "@/lib/utils";

const GUTTER_HIDE_DELAY_MS = 160;
const GUTTER_TOP_OFFSET_PX = 6;

export interface SectionChildFloatingRowState {
  blockId: string;
  getRowEl: () => HTMLElement | null;
  insertMenu: (trigger: React.ReactNode) => React.ReactNode;
  dragAttributes: DraggableAttributes;
  dragListeners: DraggableSyntheticListeners;
  onDragHandlePointerDown: () => void;
  selected: boolean;
  isDragging: boolean;
}

interface SectionChildFloatingGutterContextValue {
  registerRow: (state: SectionChildFloatingRowState) => void;
  unregisterRow: (blockId: string) => void;
  notifyRowHover: (blockId: string) => void;
  notifyRowUnhover: () => void;
}

const SectionChildFloatingGutterContext = React.createContext<SectionChildFloatingGutterContextValue | null>(
  null,
);

export function useSectionChildFloatingGutterOptional() {
  return React.useContext(SectionChildFloatingGutterContext);
}

function gutterHasOpenMenu(stackEl: HTMLElement | null) {
  return Boolean(stackEl?.querySelector("[data-section-floating-gutter] [data-state=open]"));
}

/** Register a section-child row with the stack-level floating gutter (when provider is present). */
export function useRegisterSectionChildFloatingRow(state: SectionChildFloatingRowState | null) {
  const ctx = useSectionChildFloatingGutterOptional();

  React.useLayoutEffect(() => {
    if (!ctx || !state) return;
    ctx.registerRow(state);
    return () => ctx.unregisterRow(state.blockId);
  });
}

export function SectionChildFloatingGutterProvider({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const stackRef = React.useRef<HTMLDivElement>(null);
  const rowsRef = React.useRef(new Map<string, SectionChildFloatingRowState>());
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const gutterHoverRef = React.useRef(false);
  const [rowsVersion, bumpRows] = React.useReducer((count: number) => count + 1, 0);

  const [hoveredBlockId, setHoveredBlockId] = React.useState<string | null>(null);
  const [gutterTop, setGutterTop] = React.useState(0);
  const [visible, setVisible] = React.useState(false);

  const clearHideTimer = React.useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = React.useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      if (gutterHoverRef.current || gutterHasOpenMenu(stackRef.current)) return;
      setHoveredBlockId(null);
      setVisible(false);
    }, GUTTER_HIDE_DELAY_MS);
  }, [clearHideTimer]);

  const registerRow = React.useCallback((state: SectionChildFloatingRowState) => {
    rowsRef.current.set(state.blockId, state);
    bumpRows();
  }, []);

  const unregisterRow = React.useCallback((blockId: string) => {
    rowsRef.current.delete(blockId);
    setHoveredBlockId((current) => (current === blockId ? null : current));
    bumpRows();
  }, []);

  const notifyRowHover = React.useCallback(
    (blockId: string) => {
      clearHideTimer();
      setHoveredBlockId(blockId);
      setVisible(true);
    },
    [clearHideTimer],
  );

  const notifyRowUnhover = React.useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  const activeBlockId = React.useMemo(() => {
    if (hoveredBlockId && rowsRef.current.has(hoveredBlockId)) return hoveredBlockId;
    for (const row of rowsRef.current.values()) {
      if (row.selected || row.isDragging) return row.blockId;
    }
    return null;
  }, [hoveredBlockId, visible, rowsVersion]);

  const activeRow = activeBlockId ? rowsRef.current.get(activeBlockId) : undefined;

  const repositionGutter = React.useCallback(() => {
    const stackEl = stackRef.current;
    if (!stackEl || !activeBlockId) return;
    const row = rowsRef.current.get(activeBlockId);
    const rowEl = row?.getRowEl();
    if (!rowEl) return;
    const stackRect = stackEl.getBoundingClientRect();
    const rowRect = rowEl.getBoundingClientRect();
    setGutterTop(rowRect.top - stackRect.top + GUTTER_TOP_OFFSET_PX);
  }, [activeBlockId]);

  React.useLayoutEffect(() => {
    if (!activeBlockId) return;
    repositionGutter();
    setVisible(true);
  }, [activeBlockId, repositionGutter]);

  React.useEffect(() => {
    if (!visible) return;
    const stackEl = stackRef.current;
    if (!stackEl) return;

    const onScrollOrResize = () => repositionGutter();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    const observer = new ResizeObserver(onScrollOrResize);
    observer.observe(stackEl);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      observer.disconnect();
    };
  }, [visible, activeBlockId, repositionGutter]);

  React.useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  const contextValue = React.useMemo<SectionChildFloatingGutterContextValue>(
    () => ({
      registerRow,
      unregisterRow,
      notifyRowHover,
      notifyRowUnhover,
    }),
    [registerRow, unregisterRow, notifyRowHover, notifyRowUnhover],
  );

  const showGutter = Boolean(
    visible && activeRow && (hoveredBlockId || activeRow.selected || activeRow.isDragging || gutterHasOpenMenu(stackRef.current)),
  );

  return (
    <SectionChildFloatingGutterContext.Provider value={contextValue}>
      <div ref={stackRef} className={cn("relative", className)} onMouseLeave={notifyRowUnhover}>
        {children}
        {activeRow ? (
          <div
            data-section-floating-gutter
            className={cn(
              "pointer-events-none absolute left-0 z-30 w-[4.25rem] sm:w-[4.5rem]",
              "transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none",
              showGutter ? "opacity-100" : "opacity-0",
              "has-[[data-state=open]]:pointer-events-auto has-[[data-state=open]]:opacity-100",
            )}
            style={{ transform: `translateY(${gutterTop}px)` }}
            onMouseEnter={() => {
              gutterHoverRef.current = true;
              clearHideTimer();
              setVisible(true);
            }}
            onMouseLeave={() => {
              gutterHoverRef.current = false;
              scheduleHide();
            }}
          >
            <div className="pointer-events-auto">
              <SectionChildBlockGutter
                visible
                insertMenu={activeRow.insertMenu}
                dragHandle={
                  <SectionChildDragHandle
                    aria-label="Drag to reorder"
                    onPointerDown={() => activeRow.onDragHandlePointerDown()}
                    {...activeRow.dragAttributes}
                    {...activeRow.dragListeners}
                  />
                }
              />
            </div>
          </div>
        ) : null}
      </div>
    </SectionChildFloatingGutterContext.Provider>
  );
}
