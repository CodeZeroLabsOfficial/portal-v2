"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { BlockRow } from "@/components/features/proposal/editor/block-row";
import { buildSectionChildToolbar } from "@/components/features/proposal/editor/block-toolbar-factory";
import { sectionChildChrome } from "@/lib/proposal/block-chrome";
import {
  SectionChildInsertSlot,
  SECTION_CHILD_GUTTER_INSET_CLASSES,
} from "@/components/proposal/proposal-section-child-chrome";
import { SectionChildFloatingGutterProvider } from "@/components/proposal/section-child-floating-gutter";
import {
  PROPOSAL_EDITOR_SECTION_STACK_BOTTOM_PAD_CLASSES,
  PROPOSAL_EDITOR_SECTION_STACK_GAP_CLASSES,
  proposalEditorSectionChildEdgePadClasses,
} from "@/lib/proposal/public/public-layout";
import { cn } from "@/lib/utils";
import type { AgreementBlock, BlockStyle, ProposalBlock } from "@/types/proposal";

/** Columns inner-cell chrome (structural — matches `useColumnsInnerCellChrome`). */
export interface ColumnsInnerCellChrome {
  isInnerCellActive: (blockId: string) => boolean;
  clearBlockShellSelection: (blockId: string) => void;
  callbacksFor: (blockId: string) => {
    onInnerCellActiveChange: (cellId: string | null) => void;
    registerClearCellSelection: (clear: (() => void) | null) => void;
  };
}

export interface SectionChildStackProps {
  blocks: ProposalBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  getBlockStyle: (b: ProposalBlock) => BlockStyle | undefined;
  applyBlockStyle: (id: string, style: BlockStyle | undefined) => void;
  addChildAt: (block: ProposalBlock, index: number) => void;
  updateChild: (id: string, next: ProposalBlock) => void;
  removeChild: (id: string) => void;
  moveChild: (id: string, direction: -1 | 1) => void;
  duplicateChild: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  columnsChrome: ColumnsInnerCellChrome;
  columnsLayoutEditingId: string | null;
  setColumnsLayoutEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  renderChildFields: (child: ProposalBlock) => React.ReactNode;
  renderInsertMenu: (args: {
    onAdd: (block: ProposalBlock) => void;
    trigger: React.ReactNode;
    align?: "start" | "center" | "end";
  }) => React.ReactNode;
  /** Agreement CTA / e-sign aux; only Section stacks allow nested agreement children. */
  renderAgreementAux?: (block: AgreementBlock, onChange: (next: AgreementBlock) => void) => React.ReactNode;
  emptyState: React.ReactNode;
}

/**
 * Shared stack of blocks nested in a Section or Agreement band: DnD reordering, a floating
 * overlay gutter (`+` / drag), per-row inline toolbars, and top-of-stack insert. Consolidates
 * the previously duplicated section/agreement child maps.
 */
export function SectionChildStack({
  blocks,
  selectedBlockId,
  onSelectBlock,
  getBlockStyle,
  applyBlockStyle,
  addChildAt,
  updateChild,
  removeChild,
  moveChild,
  duplicateChild,
  onReorder,
  columnsChrome,
  columnsLayoutEditingId,
  setColumnsLayoutEditingId,
  renderChildFields,
  renderInsertMenu,
  renderAgreementAux,
  emptyState,
}: SectionChildStackProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sortableChildIds = React.useMemo(() => blocks.map((c) => c.id), [blocks]);

  if (blocks.length === 0) {
    return <>{emptyState}</>;
  }

  function onChildDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((c) => c.id === active.id);
    const newIndex = blocks.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(oldIndex, newIndex);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onChildDragEnd}>
      <SortableContext items={sortableChildIds} strategy={verticalListSortingStrategy}>
        <SectionChildFloatingGutterProvider
          className={cn(
            "group/section-stack flex flex-col",
            SECTION_CHILD_GUTTER_INSET_CLASSES,
            PROPOSAL_EDITOR_SECTION_STACK_GAP_CLASSES,
            PROPOSAL_EDITOR_SECTION_STACK_BOTTOM_PAD_CLASSES,
          )}
        >
          {blocks.map((child, idx) => {
            const isSelected = selectedBlockId === child.id;
            const chrome = sectionChildChrome(child);
            const isColumns = child.type === "columns";
            return (
              <div key={child.id} className="relative isolate min-w-0">
                {idx === 0 ? (
                  <SectionChildInsertSlot
                    menu={(trigger) => renderInsertMenu({ onAdd: (b) => addChildAt(b, 0), trigger })}
                  />
                ) : null}
                <div className={proposalEditorSectionChildEdgePadClasses(idx, blocks.length)}>
                  <BlockRow
                    id={child.id}
                    selected={isSelected}
                    flush
                    layout="section-child"
                    toolbarPlacement={chrome.toolbarPlacement}
                    toolbarVisibility={chrome.toolbarVisibility}
                    selectionPolicy={chrome.selectionPolicy}
                    sectionChildInsertMenu={(trigger) =>
                      renderInsertMenu({ onAdd: (b) => addChildAt(b, idx + 1), trigger })
                    }
                    suppressToolbar={isColumns && columnsChrome.isInnerCellActive(child.id)}
                    onSelect={() => {
                      setColumnsLayoutEditingId((prev) =>
                        prev !== null && prev !== child.id ? null : prev,
                      );
                      if (isColumns) columnsChrome.clearBlockShellSelection(child.id);
                      onSelectBlock(child.id);
                    }}
                    onSelectFromNotch={
                      isColumns
                        ? () => {
                            setColumnsLayoutEditingId((prev) =>
                              prev !== null && prev !== child.id ? null : prev,
                            );
                            onSelectBlock(child.id);
                          }
                        : undefined
                    }
                    toolbar={({ dragAttributes, dragListeners }) =>
                      buildSectionChildToolbar({
                        child,
                        index: idx,
                        childCount: blocks.length,
                        dragAttributes,
                        dragListeners,
                        columnsLayoutEditingId,
                        setColumnsLayoutEditingId,
                        updateChild,
                        removeChild,
                        moveChild,
                        duplicateChild,
                        applyBlockStyle,
                        getBlockStyle,
                        renderAgreementAux,
                      })
                    }
                  >
                    {renderChildFields(child)}
                  </BlockRow>
                </div>
              </div>
            );
          })}
        </SectionChildFloatingGutterProvider>
      </SortableContext>
    </DndContext>
  );
}
