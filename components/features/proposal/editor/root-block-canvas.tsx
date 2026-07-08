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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { ProposalBlockFields } from "@/components/features/proposal/editor/proposal-block-fields";
import { BlockRow } from "@/components/features/proposal/editor/block-row";
import { BlockSelection } from "@/components/features/proposal/editor/block-selection";
import { BlockToolbarHost } from "@/components/features/proposal/editor/block-toolbar-host";
import {
  BlockToolbarForBlock,
  blockLabel,
} from "@/components/features/proposal/editor/block-toolbar-factory";
import { SectionBandShell } from "@/components/features/proposal/editor/section-band-shell";
import { ProposalSingleLayoutRichTextProvider } from "@/components/features/proposal/editor/single-layout-rich-text-context";
import { ProposalSingleLayoutToolbarStack } from "@/components/features/proposal/editor/single-layout-toolbar";
import { InsertBlockSlot } from "@/components/features/proposal/editor/document-insert-menu";
import { proposalBuilderBlockDomId } from "@/components/features/proposal/editor/builder-canvas-navigation";
import { ProposalToolbarDragHandle } from "@/components/features/proposal/editor/toolbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { rootBlockChrome } from "@/lib/proposal/block-chrome";
import { BUILDER_BAND_CONTENT_INSET_CLASSES } from "@/lib/proposal/editor-canvas-layout";
import { PROPOSAL_CANVAS_ROOT_CLASS } from "@/lib/proposal/editor-surface-tokens";
import { isSingleLayoutSection, singleLayoutSectionChild } from "@/lib/proposal/single-layout-section";
import { cn } from "@/lib/utils";
import type { BlockStyle, ProposalBlock, SectionBackground, SectionBlock } from "@/types/proposal";

export interface RootColumnsInnerCellChrome {
  isInnerCellActive: (blockId: string) => boolean;
  clearBlockShellSelection: (blockId: string) => void;
  callbacksFor: (blockId: string) => {
    onInnerCellActiveChange: (cellId: string | null) => void;
    registerClearCellSelection: (clear: (() => void) | null) => void;
  };
}

export interface RootBlockCanvasProps {
  blocks: ProposalBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  rootColumnsLayoutEditingId: string | null;
  setRootColumnsLayoutEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  rootColumnsChrome: RootColumnsInnerCellChrome;
  onReorder: (activeId: string, overId: string) => void;
  addBlockAt: (block: ProposalBlock, index: number) => void;
  updateBlock: (id: string, block: ProposalBlock) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, direction: -1 | 1) => void;
  duplicateBlock: (id: string) => void;
  applyBlockStyle: (id: string, style: BlockStyle | undefined) => void;
  patchBlockBackground: (id: string, background: SectionBackground | undefined) => void;
  getBlockStyle: (block: ProposalBlock) => BlockStyle | undefined;
}

/** Root-level sortable block list with contextual toolbars and insert seams. */
export function RootBlockCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  rootColumnsLayoutEditingId,
  setRootColumnsLayoutEditingId,
  rootColumnsChrome,
  onReorder,
  addBlockAt,
  updateBlock,
  removeBlock,
  moveBlock,
  duplicateBlock,
  applyBlockStyle,
  patchBlockBackground,
  getBlockStyle,
}: RootBlockCanvasProps) {
  const sortableBlockIds = React.useMemo(() => blocks.map((b) => b.id), [blocks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  }

  return (
    <div className={PROPOSAL_CANVAS_ROOT_CLASS}>
      <TooltipProvider delayDuration={280}>
        {blocks.length === 0 ? (
          <div className={cn(BUILDER_BAND_CONTENT_INSET_CLASSES, "pt-10")}>
            <InsertBlockSlot variant="empty" onAdd={(b) => addBlockAt(b, 0)} />
          </div>
        ) : (
          <div
            onClick={() => {
              onSelectBlock(null);
              setRootColumnsLayoutEditingId(null);
            }}
          >
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={sortableBlockIds} strategy={verticalListSortingStrategy}>
                <InsertBlockSlot onAdd={(b) => addBlockAt(b, 0)} />
                {blocks.map((block, idx) => {
                  const isSelected = selectedBlockId === block.id;
                  const chrome = rootBlockChrome(block);
                  const flushBand = chrome.toolbarPlacement === "inside-band";
                  const toolbarSuppressed =
                    block.type === "columns" && rootColumnsChrome.isInnerCellActive(block.id);

                  const handleSelect = () => {
                    setRootColumnsLayoutEditingId((prev) =>
                      prev !== null && prev !== block.id ? null : prev,
                    );
                    if (block.type === "columns") {
                      rootColumnsChrome.clearBlockShellSelection(block.id);
                    }
                    onSelectBlock(block.id);
                  };

                  return (
                    <div
                      key={block.id}
                      id={proposalBuilderBlockDomId(block.id)}
                      // Non-flush root rows carry the canvas inset so flush bands can span
                      // edge-to-edge while the whole column reflows as one unit.
                      className={cn("scroll-mt-28", !flushBand && BUILDER_BAND_CONTENT_INSET_CLASSES)}
                    >
                      <BlockRow id={block.id}>
                        {(ctx) => {
                          const toolbarActive =
                            !toolbarSuppressed &&
                            (isSelected ||
                              (chrome.toolbarVisibility === "hover-or-selected" && ctx.hovered));

                          const singleLayout = isSingleLayoutSection(block);
                          const singleLayoutChild = singleLayout
                            ? singleLayoutSectionChild(block)
                            : undefined;
                          const bandToolbarActive =
                            toolbarActive ||
                            Boolean(singleLayoutChild && selectedBlockId === singleLayoutChild.id);

                          const sectionToolbar = (
                            <BlockToolbarForBlock
                              scope="root"
                              block={block}
                              index={idx}
                              count={blocks.length}
                              dragHandle={
                                <ProposalToolbarDragHandle
                                  ariaLabel={`Reorder ${blockLabel(block.type)}`}
                                  tooltip="Drag to reposition · arrows nudge precisely"
                                  dragAttributes={ctx.dragAttributes}
                                  dragListeners={ctx.dragListeners}
                                />
                              }
                              update={(next) => updateBlock(block.id, next)}
                              remove={() => removeBlock(block.id)}
                              move={(direction) => moveBlock(block.id, direction)}
                              duplicate={() => duplicateBlock(block.id)}
                              getBlockStyle={getBlockStyle}
                              applyBlockStyle={applyBlockStyle}
                              onPatchBackground={(next) => patchBlockBackground(block.id, next)}
                              columnsLayout={
                                block.type === "columns"
                                  ? {
                                      editing: rootColumnsLayoutEditingId === block.id,
                                      onStartEdit: () => setRootColumnsLayoutEditingId(block.id),
                                      onEndEdit: () => setRootColumnsLayoutEditingId(null),
                                    }
                                  : undefined
                              }
                            />
                          );

                          const toolbar = toolbarSuppressed ? null : (
                            <BlockToolbarHost
                              placement={chrome.toolbarPlacement}
                              active={bandToolbarActive}
                            >
                              {singleLayout && singleLayoutChild ? (
                                <ProposalSingleLayoutToolbarStack
                                  sectionToolbar={sectionToolbar}
                                  child={singleLayoutChild}
                                  active={bandToolbarActive}
                                  onUpdateChild={(next) =>
                                    updateBlock(block.id, {
                                      ...(block as SectionBlock),
                                      children: [next],
                                    })
                                  }
                                  getBlockStyle={getBlockStyle}
                                  applyBlockStyle={applyBlockStyle}
                                />
                              ) : (
                                sectionToolbar
                              )}
                            </BlockToolbarHost>
                          );

                          const fields = (
                            <ProposalBlockFields
                              block={block}
                              onChange={(next) => updateBlock(block.id, next)}
                              selection={{
                                selectedId: selectedBlockId,
                                onSelect: onSelectBlock,
                              }}
                              getBlockStyle={getBlockStyle}
                              applyBlockStyle={applyBlockStyle}
                              formattingChrome={singleLayout ? "band" : undefined}
                              columnsLayoutEditing={{
                                activeId: rootColumnsLayoutEditingId,
                                setActiveId: setRootColumnsLayoutEditingId,
                              }}
                              columnsInnerCellCallbacks={
                                block.type === "columns"
                                  ? rootColumnsChrome.callbacksFor(block.id)
                                  : undefined
                              }
                            />
                          );

                          const rowContent = flushBand ? (
                            <SectionBandShell block={block} toolbar={toolbar}>
                              {fields}
                            </SectionBandShell>
                          ) : (
                            <>
                              {toolbar}
                              {fields}
                            </>
                          );

                          return (
                            <BlockSelection
                              variant="root"
                              selected={isSelected}
                              hovered={ctx.hovered}
                              isDragging={ctx.isDragging}
                              flush={flushBand}
                              lightSurface={block.type !== "section"}
                              onSelect={handleSelect}
                            >
                              {singleLayout ? (
                                <ProposalSingleLayoutRichTextProvider>
                                  {rowContent}
                                </ProposalSingleLayoutRichTextProvider>
                              ) : (
                                rowContent
                              )}
                            </BlockSelection>
                          );
                        }}
                      </BlockRow>
                      <InsertBlockSlot onAdd={(b) => addBlockAt(b, idx + 1)} />
                    </div>
                  );
                })}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </TooltipProvider>
    </div>
  );
}
