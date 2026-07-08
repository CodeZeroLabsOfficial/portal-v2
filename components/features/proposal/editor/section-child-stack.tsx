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

import { BlockRow, type BlockRowContext } from "@/components/features/proposal/editor/block-row";
import { BlockSelection } from "@/components/features/proposal/editor/block-selection";
import { BlockToolbarHost } from "@/components/features/proposal/editor/block-toolbar-host";
import { SectionChildInsertSlot } from "@/components/proposal/proposal-section-child-chrome";
import {
  SectionChildFloatingGutterProvider,
  useRegisterSectionChildFloatingRow,
  useSectionChildFloatingGutterOptional,
} from "@/components/proposal/section-child-floating-gutter";
import { sectionChildChrome } from "@/lib/proposal/block-chrome";
import {
  PROPOSAL_EDITOR_SECTION_STACK_BOTTOM_PAD_CLASSES,
  PROPOSAL_EDITOR_SECTION_STACK_GAP_CLASSES,
  proposalEditorSectionChildEdgePadClasses,
} from "@/lib/proposal/public/public-layout";
import { cn } from "@/lib/utils";
import type { ProposalBlock } from "@/types/proposal";

export interface SectionChildStackProps<B extends ProposalBlock> {
  blocks: readonly B[];
  selectedBlockId: string | null;
  /** Reorder after a drag: indexes into {@link blocks}. */
  onReorder: (oldIndex: number, newIndex: number) => void;
  /** Insert-menu factory; `index` is the insertion position within the stack. */
  insertMenu: (index: number, trigger: React.ReactNode) => React.ReactNode;
  renderChild: (child: B) => React.ReactNode;
  renderToolbar: (child: B, index: number) => React.ReactNode;
  /** Hide the row toolbar (e.g. while a nested column cell is being edited). */
  suppressToolbar?: (child: B) => boolean;
  onSelectChild: (child: B) => void;
  /** Drag-notch select — keeps nested column-cell focus intact. */
  onSelectChildFromNotch?: (child: B) => void;
}

/**
 * Shared stack for blocks nested in a section/agreement band: DnD context, insert
 * seams, floating overlay gutter, row selection, and above-row toolbars. Rendering
 * of each block's fields and toolbar is supplied by the parent (render props) so the
 * stack stays decoupled from the block editors.
 */
export function SectionChildStack<B extends ProposalBlock>({
  blocks,
  selectedBlockId,
  onReorder,
  insertMenu,
  renderChild,
  renderToolbar,
  suppressToolbar,
  onSelectChild,
  onSelectChildFromNotch,
}: SectionChildStackProps<B>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const sortableIds = React.useMemo(() => blocks.map((b) => b.id), [blocks]);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(oldIndex, newIndex);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <SectionChildFloatingGutterProvider
          className={cn(
            "group/section-stack flex flex-col",
            PROPOSAL_EDITOR_SECTION_STACK_GAP_CLASSES,
            blocks.length > 0 && PROPOSAL_EDITOR_SECTION_STACK_BOTTOM_PAD_CLASSES,
          )}
        >
          {blocks.map((child, idx) => (
            <div key={child.id} className="relative isolate min-w-0">
              {idx === 0 ? (
                <SectionChildInsertSlot menu={(trigger) => insertMenu(0, trigger)} />
              ) : null}
              <div className={proposalEditorSectionChildEdgePadClasses(idx, blocks.length)}>
                <SectionChildRow
                  child={child}
                  index={idx}
                  selected={selectedBlockId === child.id}
                  suppressed={suppressToolbar?.(child) ?? false}
                  insertMenu={insertMenu}
                  renderChild={renderChild}
                  renderToolbar={renderToolbar}
                  onSelect={() => onSelectChild(child)}
                  onSelectFromNotch={
                    onSelectChildFromNotch ? () => onSelectChildFromNotch(child) : undefined
                  }
                />
              </div>
            </div>
          ))}
        </SectionChildFloatingGutterProvider>
      </SortableContext>
    </DndContext>
  );
}

interface SectionChildRowProps<B extends ProposalBlock> {
  child: B;
  index: number;
  selected: boolean;
  suppressed: boolean;
  insertMenu: (index: number, trigger: React.ReactNode) => React.ReactNode;
  renderChild: (child: B) => React.ReactNode;
  renderToolbar: (child: B, index: number) => React.ReactNode;
  onSelect: () => void;
  onSelectFromNotch?: () => void;
}

function SectionChildRow<B extends ProposalBlock>({
  child,
  index,
  selected,
  suppressed,
  insertMenu,
  renderChild,
  renderToolbar,
  onSelect,
  onSelectFromNotch,
}: SectionChildRowProps<B>) {
  const floatingGutter = useSectionChildFloatingGutterOptional();

  return (
    <BlockRow
      id={child.id}
      className={cn("scroll-mt-28 data-[hovered]:z-10", selected && "z-10")}
      onHoverChange={(hovered) => {
        if (hovered) floatingGutter?.notifyRowHover(child.id);
        else floatingGutter?.notifyRowUnhover();
      }}
    >
      {(ctx) => (
        <SectionChildRowChrome
          ctx={ctx}
          child={child}
          index={index}
          selected={selected}
          suppressed={suppressed}
          insertMenu={insertMenu}
          renderChild={renderChild}
          renderToolbar={renderToolbar}
          onSelect={onSelect}
          onSelectFromNotch={onSelectFromNotch}
        />
      )}
    </BlockRow>
  );
}

function SectionChildRowChrome<B extends ProposalBlock>({
  ctx,
  child,
  index,
  selected,
  suppressed,
  insertMenu,
  renderChild,
  renderToolbar,
  onSelect,
  onSelectFromNotch,
}: SectionChildRowProps<B> & { ctx: BlockRowContext }) {
  useRegisterSectionChildFloatingRow({
    blockId: child.id,
    getRowEl: ctx.getRowEl,
    insertMenu: (trigger) => insertMenu(index + 1, trigger),
    dragAttributes: ctx.dragAttributes,
    dragListeners: ctx.dragListeners,
    onDragHandlePointerDown: () => (onSelectFromNotch ?? onSelect)(),
    selected,
    isDragging: ctx.isDragging,
  });

  const chrome = sectionChildChrome(child);
  const toolbarActive =
    !suppressed &&
    (selected || (chrome.toolbarVisibility === "hover-or-selected" && ctx.hovered));

  return (
    <div className="relative min-w-0">
      {suppressed ? null : (
        <BlockToolbarHost placement={chrome.toolbarPlacement} active={toolbarActive}>
          {renderToolbar(child, index)}
        </BlockToolbarHost>
      )}
      <BlockSelection
        variant="section-child"
        selected={selected}
        hovered={ctx.hovered}
        isDragging={ctx.isDragging}
        onSelect={onSelect}
      >
        {renderChild(child)}
      </BlockSelection>
    </div>
  );
}
