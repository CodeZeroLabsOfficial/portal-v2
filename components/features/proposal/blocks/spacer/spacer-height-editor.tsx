"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SpacerBlock } from "@/types/proposal";

const SPACER_HEIGHT_MIN_PX = 1;
const SPACER_HEIGHT_MAX_PX = 2400;

function clampSpacerHeightPx(n: number): number {
  return Math.min(SPACER_HEIGHT_MAX_PX, Math.max(SPACER_HEIGHT_MIN_PX, Math.round(n)));
}

export interface SpacerBlockHeightEditorProps {
  block: SpacerBlock;
  onChange: (next: SpacerBlock) => void;
}

/** Drag-resize spacer editor — preserves monolith UX (1–2400px). */
export function SpacerBlockHeightEditor({ block, onChange }: SpacerBlockHeightEditorProps) {
  const h =
    typeof block.heightPx === "number" && Number.isFinite(block.heightPx)
      ? clampSpacerHeightPx(block.heightPx)
      : 40;
  const dragRef = React.useRef<{ startY: number; startH: number } | null>(null);

  function applyHeight(next: number) {
    onChange({ ...block, heightPx: clampSpacerHeightPx(next) });
  }

  const gripPx = Math.min(28, Math.max(6, Math.round(h * 0.28)));
  const labelHeight = Math.max(0, h - gripPx);

  return (
    <div className="w-full">
      <label htmlFor={`spacer-h-a11y-${block.id}`} className="sr-only">
        Spacer height in pixels (1–2400)
      </label>
      <input
        id={`spacer-h-a11y-${block.id}`}
        type="number"
        min={SPACER_HEIGHT_MIN_PX}
        max={SPACER_HEIGHT_MAX_PX}
        value={h}
        onChange={(e) => {
          const raw = e.target.value;
          const n = raw === "" ? NaN : Number(raw);
          if (!Number.isFinite(n)) return;
          applyHeight(n);
        }}
        className="sr-only"
      />

      <div
        className="relative w-full overflow-hidden rounded-md border border-dashed border-primary/30 bg-muted/25 dark:border-primary/40 dark:bg-muted/15"
        style={{ height: h }}
        role="group"
        aria-label={`Spacer, ${h} pixels tall`}
      >
        {labelHeight > 0 ? (
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-center px-2"
            style={{ height: labelHeight }}
          >
            <span
              className={cn(
                "font-semibold tabular-nums tracking-tight text-muted-foreground",
                labelHeight < 22 ? "text-xs leading-none" : "text-sm",
              )}
            >
              {h}px
            </span>
          </div>
        ) : (
          <span className="sr-only">{h} pixels</span>
        )}

        <button
          type="button"
          style={{ height: gripPx }}
          className="absolute bottom-0 left-0 right-0 z-[2] flex cursor-ns-resize touch-none items-center justify-center gap-0.5 border-0 bg-muted/40 p-0 text-primary outline-none backdrop-blur-[2px] transition-colors hover:bg-primary/15 focus-visible:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-muted/30"
          aria-label="Drag to resize spacer height"
          title="Drag up or down to change height"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            dragRef.current = { startY: e.clientY, startH: h };
            (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const d = dragRef.current;
            if (!d) return;
            applyHeight(d.startH + (e.clientY - d.startY));
          }}
          onPointerUp={(e) => {
            dragRef.current = null;
            try {
              (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
            } catch {
              /* released */
            }
          }}
          onPointerCancel={(e) => {
            dragRef.current = null;
            try {
              (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
            } catch {
              /* released */
            }
          }}
        >
          <ChevronUp className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
          <div className="flex h-3 w-10 items-center justify-center" aria-hidden>
            <Minus className="h-3 w-8 text-primary opacity-80" strokeWidth={2.5} />
          </div>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
        </button>
      </div>

      <p className="mt-1.5 text-xs text-muted-foreground">
        Drag the bottom edge to set height. Readers only see vertical space — no line or label.
      </p>
    </div>
  );
}
