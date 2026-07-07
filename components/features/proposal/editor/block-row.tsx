"use client";

import * as React from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  useRegisterSectionChildFloatingRow,
  useSectionChildFloatingGutterOptional,
} from "@/components/proposal/section-child-floating-gutter";
import { useProposalSectionEditorChrome } from "@/components/proposal/proposal-section-editor-chrome";
import { PROPOSAL_CANVAS_SURFACE_LIGHT_CLASSES } from "@/lib/proposal/editor-surface-tokens";
import type {
  BlockSelectionPolicy,
  ToolbarPlacement,
  ToolbarVisibility,
} from "@/lib/proposal/block-chrome";
import { blockSelectionRingClasses, shouldSelectFromClick } from "@/components/features/proposal/editor/block-selection";
import { BlockToolbarHost } from "@/components/features/proposal/editor/block-toolbar-host";
import { cn } from "@/lib/utils";

export interface BlockRowToolbarContext {
  dragAttributes: DraggableAttributes;
  dragListeners: DraggableSyntheticListeners;
}

export interface BlockRowProps {
  id: string;
  children: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  /** Drag notch select: keeps nested column-cell focus intact (columns blocks). */
  onSelectFromNotch?: () => void;
  layout?: "default" | "section-child";
  /** Full-bleed band: no vertical padding on the row wrapper. */
  flush?: boolean;
  /** Root-level block outside a section — remap tokens for dark admin chrome over a light canvas. */
  rootLightSurface?: boolean;
  /** Hide the toolbar while editing nested content (e.g. column cell rich text). */
  suppressToolbar?: boolean;
  toolbarPlacement: ToolbarPlacement;
  toolbarVisibility: ToolbarVisibility;
  selectionPolicy: BlockSelectionPolicy;
  /** Section-child row: `+` beside the drag notch (insert below this block). */
  sectionChildInsertMenu?: (plusTrigger: React.ReactNode) => React.ReactNode;
  toolbar?: (ctx: BlockRowToolbarContext) => React.ReactNode;
}

/**
 * Sortable block row: drag wiring, selection ring, click-to-select, and a toolbar host.
 * Toolbar placement and visibility are declarative (driven by the block-chrome registry).
 */
export function BlockRow({
  id,
  children,
  selected,
  onSelect,
  onSelectFromNotch,
  layout = "default",
  flush = false,
  rootLightSurface = false,
  suppressToolbar = false,
  toolbarPlacement,
  toolbarVisibility,
  selectionPolicy,
  sectionChildInsertMenu,
  toolbar,
}: BlockRowProps) {
  const [hovered, setHovered] = React.useState(false);
  const rowElRef = React.useRef<HTMLDivElement | null>(null);
  const floatingGutter = useSectionChildFloatingGutterOptional();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const sectionChrome = useProposalSectionEditorChrome();
  const seamless = sectionChrome?.seamless ?? false;
  const elevatedSection = sectionChrome?.appearance === "elevated";
  const sectionChild = layout === "section-child";
  const useFloatingGutter = sectionChild && Boolean(sectionChildInsertMenu && floatingGutter);

  const setRowRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rowElRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  useRegisterSectionChildFloatingRow(
    useFloatingGutter
      ? {
          blockId: id,
          getRowEl: () => rowElRef.current,
          insertMenu: sectionChildInsertMenu!,
          dragAttributes: attributes,
          dragListeners: listeners,
          onDragHandlePointerDown: () => (onSelectFromNotch ?? onSelect)(),
          selected,
          isDragging,
        }
      : null,
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const ringClasses = blockSelectionRingClasses({
    seamless,
    elevatedSection,
    sectionChild,
    selected,
    hovered,
    isDragging,
  });

  return (
    <div
      ref={useFloatingGutter ? setRowRef : setNodeRef}
      style={style}
      data-section-child-row={useFloatingGutter ? id : undefined}
      className={cn(
        "group/sortblock relative scroll-mt-28",
        isDragging && "opacity-55",
        sectionChild && (selected || hovered) && "z-10",
      )}
      onMouseEnter={() => {
        setHovered(true);
        if (useFloatingGutter) floatingGutter?.notifyRowHover(id);
      }}
      onMouseLeave={() => {
        setHovered(false);
        if (useFloatingGutter) floatingGutter?.notifyRowUnhover();
      }}
    >
      <div className={cn("relative min-w-0", sectionChild ? "flex-1" : "w-full")}>
        {toolbar ? (
          <BlockToolbarHost
            placement={toolbarPlacement}
            visibility={toolbarVisibility}
            selected={selected}
            rowHovered={hovered}
            suppressed={suppressToolbar}
          >
            {toolbar({ dragAttributes: attributes, dragListeners: listeners })}
          </BlockToolbarHost>
        ) : null}
        <div
          role="presentation"
          onClick={(e) => {
            const el = e.target as HTMLElement;
            if (!shouldSelectFromClick(el, selectionPolicy, e.metaKey || e.ctrlKey)) return;
            e.stopPropagation();
            onSelect();
          }}
          className={cn(
            "relative min-w-0 [-webkit-tap-highlight-color:transparent]",
            !sectionChild && "px-0",
            !sectionChild && (flush ? "py-0" : "py-1.5"),
            sectionChild && "py-0.5",
            rootLightSurface && PROPOSAL_CANVAS_SURFACE_LIGHT_CLASSES,
            ringClasses,
          )}
        >
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
