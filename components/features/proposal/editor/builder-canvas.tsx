"use client";

import * as React from "react";

import {
  BUILDER_CANVAS_BOTTOM_RESERVE_CLASSES,
  BUILDER_CANVAS_TOP_RESERVE_CLASSES,
} from "@/lib/proposal/editor-canvas-layout";
import { cn } from "@/lib/utils";

/**
 * Full-bleed canvas content wrapper: zero horizontal/top padding so flush bands span
 * the whole column, sized as a container (`@container/canvas`) for content that wants
 * to respond to the column width rather than the viewport.
 */
export function BuilderCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "@container/canvas w-full min-w-0",
        BUILDER_CANVAS_TOP_RESERVE_CLASSES,
        BUILDER_CANVAS_BOTTOM_RESERVE_CLASSES,
      )}
    >
      {children}
    </div>
  );
}
