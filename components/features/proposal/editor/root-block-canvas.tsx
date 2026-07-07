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
  SortableShell,
  blockLabel,
} from "@/components/features/proposal/editor/proposal-block-fields";
import { InsertBlockSlot } from "@/components/features/proposal/editor/document-insert-menu";
import { proposalBuilderBlockDomId } from "@/components/features/proposal/editor/builder-canvas-navigation";
import { ProposalToolbarDragHandle } from "@/components/features/proposal/editor/toolbar";
import { ProposalBlockToolbar } from "@/components/proposal/proposal-block-toolbar";
import { ColumnsBlockToolbarPrimarySlot } from "@/components/proposal/columns-block-layout-controls";
import { ProposalImageBlockToolbar } from "@/components/proposal/proposal-image-block-toolbar";
import { ProposalSectionBackgroundPicker } from "@/components/proposal/proposal-section-background-picker";
import { ProposalSplashBackgroundPickerWithBranding } from "@/components/proposal/proposal-splash-editor";
import { TooltipProvider } from "@/components/ui/tooltip";
import { packagesAddonsSectionActive } from "@/lib/proposal/commerce/packages-totals";
import { proposalBlockRendersFlushEditorBand } from "@/lib/proposal/blocks";
import { PROPOSAL_CANVAS_ROOT_CLASS } from "@/lib/proposal/editor-surface-tokens";
import type {
  AgreementBlock,
  BlockStyle,
  ColumnsBlock,
  ImageBlock,
  PackagesBlock,
  ProposalBlock,
  SectionBackground,
  SplashBlock,
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
          <InsertBlockSlot variant="empty" onAdd={(b) => addBlockAt(b, 0)} />
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
                  const supportsStyle = block.type === "packages" || block.type === "pricing";
                  const flushBand = proposalBlockRendersFlushEditorBand(block);
                  const isSection = block.type === "section";
                  return (
                    <div key={block.id} id={proposalBuilderBlockDomId(block.id)} className="scroll-mt-28">
                      <SortableShell
                        id={block.id}
                        selected={isSelected}
                        flush={flushBand}
                        rootLightSurface={block.type !== "section"}
                        toolbarShowOnHover={block.type !== "image" && block.type !== "icon"}
                        suppressToolbar={
                          block.type === "columns" && rootColumnsChrome.isInnerCellActive(block.id)
                        }
                        onSelect={() => {
                          setRootColumnsLayoutEditingId((prev) =>
                            prev !== null && prev !== block.id ? null : prev,
                          );
                          if (block.type === "columns") {
                            rootColumnsChrome.clearBlockShellSelection(block.id);
                          }
                          onSelectBlock(block.id);
                        }}
                        onSelectFromNotch={
                          block.type === "columns"
                            ? () => {
                                setRootColumnsLayoutEditingId((prev) =>
                                  prev !== null && prev !== block.id ? null : prev,
                                );
                                onSelectBlock(block.id);
                              }
                            : undefined
                        }
                        toolbar={({ dragAttributes, dragListeners }) => {
                          const dragHandle = (
                            <ProposalToolbarDragHandle
                              ariaLabel={`Reorder ${blockLabel(block.type)}`}
                              tooltip="Drag to reposition · arrows nudge precisely"
                              dragAttributes={dragAttributes}
                              dragListeners={dragListeners}
                            />
                          );
                          const compactColumnsChrome = block.type === "columns";
                          if (block.type === "image") {
                            const ib = block as ImageBlock;
                            return (
                              <div className="flex w-full items-start justify-between gap-1.5">
                                {dragHandle}
                                <ProposalImageBlockToolbar
                                  variant="shell"
                                  block={ib}
                                  onChange={(next) => updateBlock(block.id, next)}
                                  onDelete={() => removeBlock(block.id)}
                                />
                              </div>
                            );
                          }
                          return (
                            <ProposalBlockToolbar
                              blockType={
                                block.type === "pricing"
                                  ? "pricing"
                                  : block.type === "packages"
                                    ? "packages"
                                    : block.type === "agreement"
                                      ? "agreement"
                                      : block.type === "section"
                                        ? "section"
                                        : "other"
                              }
                              deleteLabel={isSection ? "Remove section" : "Delete block"}
                              canMoveUp={idx > 0}
                              canMoveDown={idx < blocks.length - 1}
                              onMoveUp={() => moveBlock(block.id, -1)}
                              onMoveDown={() => moveBlock(block.id, 1)}
                              onDuplicate={() => duplicateBlock(block.id)}
                              onDelete={() => removeBlock(block.id)}
                              compactChrome={compactColumnsChrome}
                              compactPrimarySlot={
                                compactColumnsChrome ? (
                                  <ColumnsBlockToolbarPrimarySlot
                                    block={block as ColumnsBlock}
                                    editing={rootColumnsLayoutEditingId === block.id}
                                    onStartEdit={() => setRootColumnsLayoutEditingId(block.id)}
                                    onEndEdit={() => setRootColumnsLayoutEditingId(null)}
                                    onPatch={(patch) => {
                                      if (block.type !== "columns") return;
                                      updateBlock(block.id, { ...block, ...patch });
                                    }}
                                  />
                                ) : undefined
                              }
                              overflowLeadingAction={
                                block.type === "packages" &&
                                packagesAddonsSectionActive(block as PackagesBlock)
                                  ? {
                                      label: "Remove add-ons table",
                                      onClick: () => {
                                        const p = block as PackagesBlock;
                                        updateBlock(block.id, { ...p, addonsSectionEnabled: false });
                                      },
                                    }
                                  : undefined
                              }
                              auxiliarySlot={
                                block.type === "agreement" ? (
                                  <AgreementToolbarAgreementAux
                                    block={block as AgreementBlock}
                                    onChange={(next) => updateBlock(block.id, next)}
                                  />
                                ) : undefined
                              }
                              showOverflowMenu={!isSection && block.type !== "splash"}
                              style={supportsStyle ? getBlockStyle(block) : undefined}
                              onStyleChange={
                                supportsStyle ? (next) => applyBlockStyle(block.id, next) : undefined
                              }
                              backdropPickerSlot={
                                block.type === "section" ? (
                                  <ProposalSectionBackgroundPicker
                                    background={block.background}
                                    onChange={(next) => patchBlockBackground(block.id, next)}
                                  />
                                ) : block.type === "packages" ? (
                                  <ProposalSectionBackgroundPicker
                                    background={(block as PackagesBlock).background}
                                    onChange={(next) => patchBlockBackground(block.id, next)}
                                  />
                                ) : block.type === "agreement" ? (
                                  <ProposalSectionBackgroundPicker
                                    background={(block as AgreementBlock).background}
                                    onChange={(next) => patchBlockBackground(block.id, next)}
                                  />
                                ) : block.type === "splash" ? (
                                  <ProposalSplashBackgroundPickerWithBranding
                                    block={block as SplashBlock}
                                    onChange={(next) => updateBlock(block.id, next)}
                                  />
                                ) : undefined
                              }
                              leadingSlot={dragHandle}
                              trailingSlot={undefined}
                            />
                          );
                        }}
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
                            block.type === "columns"
                              ? rootColumnsChrome.callbacksFor(block.id)
                              : undefined
                          }
                        />
                      </SortableShell>
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
