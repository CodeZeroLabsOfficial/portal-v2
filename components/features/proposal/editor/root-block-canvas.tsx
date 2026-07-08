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

import {
  AgreementToolbarAgreementAux,
  ProposalBlockFields,
} from "@/components/features/proposal/editor/proposal-block-fields";
import { BlockRow } from "@/components/features/proposal/editor/block-row";
import { buildRootBlockToolbar } from "@/components/features/proposal/editor/block-toolbar-factory";
import { InsertBlockSlot } from "@/components/features/proposal/editor/document-insert-menu";
import { proposalBuilderBlockDomId } from "@/components/features/proposal/editor/builder-canvas-navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { rootBlockChrome } from "@/lib/proposal/block-chrome";
import { BUILDER_ROOT_BLOCK_INSET_CLASSES } from "@/lib/proposal/editor-canvas-layout";
import { proposalBlockRendersFlushEditorBand } from "@/lib/proposal/blocks";
import { PROPOSAL_CANVAS_ROOT_CLASS } from "@/lib/proposal/editor-surface-tokens";
import { cn } from "@/lib/utils";
import type {
  AgreementBlock,
  BlockStyle,
  ProposalBlock,
  SectionBackground,
} from "@/types/proposal";

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
  // Match the leading seam to the first block: constrained for reading-column blocks, full-bleed
  // when the first block is a flush band so the seam spans edge-to-edge like the band beneath it.
  const leadingSeamConstrained = blocks.length > 0 && !proposalBlockRendersFlushEditorBand(blocks[0]);

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

  const renderAgreementAux = React.useCallback(
    (agreementBlock: AgreementBlock, onAgreementChange: (next: AgreementBlock) => void) => (
      <AgreementToolbarAgreementAux block={agreementBlock} onChange={onAgreementChange} />
    ),
    [],
  );

  return (
    <div className={PROPOSAL_CANVAS_ROOT_CLASS}>
      <TooltipProvider delayDuration={280}>
        {blocks.length === 0 ? (
          <div className={BUILDER_ROOT_BLOCK_INSET_CLASSES}>
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
                <InsertBlockSlot
                  onAdd={(b) => addBlockAt(b, 0)}
                  constrained={leadingSeamConstrained}
                />
                {blocks.map((block, idx) => {
                  const isSelected = selectedBlockId === block.id;
                  const flushBand = proposalBlockRendersFlushEditorBand(block);
                  const chrome = rootBlockChrome(block);
                  const isColumns = block.type === "columns";
                  return (
                    <div
                      key={block.id}
                      id={proposalBuilderBlockDomId(block.id)}
                      className={cn("scroll-mt-28", !flushBand && BUILDER_ROOT_BLOCK_INSET_CLASSES)}
                    >
                      <BlockRow
                        id={block.id}
                        selected={isSelected}
                        flush={flushBand}
                        rootLightSurface={block.type !== "section"}
                        toolbarPlacement={chrome.toolbarPlacement}
                        toolbarVisibility={chrome.toolbarVisibility}
                        selectionPolicy={chrome.selectionPolicy}
                        suppressToolbar={isColumns && rootColumnsChrome.isInnerCellActive(block.id)}
                        onSelect={() => {
                          setRootColumnsLayoutEditingId((prev) =>
                            prev !== null && prev !== block.id ? null : prev,
                          );
                          if (isColumns) {
                            rootColumnsChrome.clearBlockShellSelection(block.id);
                          }
                          onSelectBlock(block.id);
                        }}
                        onSelectFromNotch={
                          isColumns
                            ? () => {
                                setRootColumnsLayoutEditingId((prev) =>
                                  prev !== null && prev !== block.id ? null : prev,
                                );
                                onSelectBlock(block.id);
                              }
                            : undefined
                        }
                        toolbar={({ dragAttributes, dragListeners }) =>
                          buildRootBlockToolbar({
                            block,
                            index: idx,
                            blockCount: blocks.length,
                            dragAttributes,
                            dragListeners,
                            rootColumnsLayoutEditingId,
                            setRootColumnsLayoutEditingId,
                            updateBlock,
                            removeBlock,
                            moveBlock,
                            duplicateBlock,
                            applyBlockStyle,
                            patchBlockBackground,
                            getBlockStyle,
                            renderAgreementAux,
                          })
                        }
                      >
                        <ProposalBlockFields
                          block={block}
                          onChange={(next) => updateBlock(block.id, next)}
                          selection={{
                            selectedId: selectedBlockId,
                            onSelect: onSelectBlock,
                          }}
                          getBlockStyle={getBlockStyle}
                          applyBlockStyle={applyBlockStyle}
                          columnsLayoutEditing={{
                            activeId: rootColumnsLayoutEditingId,
                            setActiveId: setRootColumnsLayoutEditingId,
                          }}
                          columnsInnerCellCallbacks={
                            isColumns ? rootColumnsChrome.callbacksFor(block.id) : undefined
                          }
                        />
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
