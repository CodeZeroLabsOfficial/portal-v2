"use client";

import * as React from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";

export interface BlockRowContext {
  dragAttributes: DraggableAttributes;
  dragListeners: DraggableSyntheticListeners;
  isDragging: boolean;
  hovered: boolean;
  getRowEl: () => HTMLElement | null;
}

export interface BlockRowProps {
  id: string;
  className?: string;
  /** Row hover feed for toolbar visibility / floating gutter coordination. */
  onHoverChange?: (hovered: boolean) => void;
  children: (ctx: BlockRowContext) => React.ReactNode;
}

/**
 * dnd-kit sortable row — transform/transition plumbing and hover tracking only.
 * Selection rings and toolbars are separate primitives layered inside.
 */
export function BlockRow({ id, className, onHoverChange, children }: BlockRowProps) {
  const [hovered, setHovered] = React.useState(false);
  const rowElRef = React.useRef<HTMLDivElement | null>(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const setRowRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rowElRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  const getRowEl = React.useCallback(() => rowElRef.current, []);

  return (
    <div
      ref={setRowRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-block-row={id}
      className={cn("relative min-w-0", isDragging && "opacity-55", className)}
      onMouseEnter={() => {
        setHovered(true);
        onHoverChange?.(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        onHoverChange?.(false);
      }}
    >
      {children({
        dragAttributes: attributes,
        dragListeners: listeners,
        isDragging,
        hovered,
        getRowEl,
      })}
    </div>
  );
}
