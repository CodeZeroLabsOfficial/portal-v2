"use client";

import * as React from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type {
  BlockStyle,
  PackagesBlock,
  ProposalBlock,
  ProposalContentBlock,
  SectionBlock,
} from "@/types/proposal";
import { ProposalSectionShell } from "@/components/features/proposal/editor/section-chrome/proposal-section-shell";
import { BlockToolbarForBlock } from "@/components/features/proposal/editor/block-toolbar-factory";
import { SectionChildStack } from "@/components/features/proposal/editor/section-child-stack";
import { SectionInsertMenu } from "@/components/features/proposal/editor/block-insert-menus";
import { cloneBlockWithFreshIds } from "@/components/features/proposal/editor/block-field-utils";
import { useColumnsInnerCellChrome } from "@/components/features/proposal/editor/columns-inner-cell-chrome";
import { ProposalBlockFields } from "@/components/features/proposal/editor/proposal-block-fields";
import { PROPOSAL_EDITOR_SECTION_INNER_PAD_CLASSES } from "@/lib/proposal/public/public-layout";
import { cn } from "@/lib/utils";

export function SectionBlockFields({
  block,
  onChange,
  selectedBlockId,
  onSelectBlock,
  getBlockStyle,
  applyBlockStyle,
}: {
  block: SectionBlock;
  onChange: (next: ProposalBlock) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  getBlockStyle: (b: ProposalBlock) => BlockStyle | undefined;
  applyBlockStyle: (id: string, style: BlockStyle | undefined) => void;
}) {
  const children = block.children;
  const [columnsLayoutEditingId, setColumnsLayoutEditingId] = React.useState<string | null>(null);
  const columnsChrome = useColumnsInnerCellChrome();

  React.useEffect(() => {
    if (columnsLayoutEditingId && !children.some((c) => c.id === columnsLayoutEditingId)) {
      setColumnsLayoutEditingId(null);
    }
  }, [children, columnsLayoutEditingId]);

  function setChildren(nextChildren: ProposalContentBlock[]) {
    onChange({ ...block, children: nextChildren });
  }

  function updateChild(childId: string, next: ProposalContentBlock) {
    setChildren(children.map((c) => (c.id === childId ? next : c)));
  }

  function removeChild(childId: string) {
    setChildren(children.filter((c) => c.id !== childId));
    if (selectedBlockId === childId) onSelectBlock(null);
    if (columnsLayoutEditingId === childId) setColumnsLayoutEditingId(null);
  }

  function addChildAt(b: ProposalBlock, index: number) {
    const c = b as ProposalContentBlock;
    const next = [...children];
    next.splice(Math.max(0, Math.min(index, next.length)), 0, c);
    setChildren(next);
  }

  function moveChild(childId: string, direction: -1 | 1) {
    const idx = children.findIndex((c) => c.id === childId);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= children.length) return;
    setChildren(arrayMove(children, idx, target));
  }

  function duplicateChild(childId: string) {
    const idx = children.findIndex((c) => c.id === childId);
    if (idx < 0) return;
    const cloned = cloneBlockWithFreshIds(children[idx] as ProposalBlock) as ProposalContentBlock;
    const next = [...children];
    next.splice(idx + 1, 0, cloned);
    setChildren(next);
    onSelectBlock(null);
  }

  const isSingleLayout = block.layout === "single";

  const sectionStack = isSingleLayout ? (
    children[0] ? (
      <div
        className={cn("min-w-0", PROPOSAL_EDITOR_SECTION_INNER_PAD_CLASSES)}
        data-proposal-section-child-content
      >
        <ProposalBlockFields
          block={children[0]}
          onChange={(next) => updateChild(children[0]!.id, next as ProposalContentBlock)}
          selection={{
            selectedId: selectedBlockId,
            onSelect: onSelectBlock,
          }}
          getBlockStyle={getBlockStyle}
          applyBlockStyle={applyBlockStyle}
          formattingChrome="band"
          columnsLayoutEditing={{
            activeId: columnsLayoutEditingId,
            setActiveId: setColumnsLayoutEditingId,
          }}
          columnsInnerCellCallbacks={
            children[0].type === "columns" ? columnsChrome.callbacksFor(children[0].id) : undefined
          }
        />
      </div>
    ) : null
  ) : children.length === 0 ? (
      <div className="flex flex-col items-center gap-5 py-14 text-center">
        <div className="max-w-[20rem] space-y-1">
          <p className="text-sm font-medium text-foreground">Group related content</p>
          <p className="text-xs text-muted-foreground">
            Stack headings, prose, visuals, layouts, accordion panels, and more — then reorder with the contextual
            controls.
          </p>
        </div>
        <SectionInsertMenu
          align="center"
          onAdd={(b) => addChildAt(b, 0)}
          trigger={
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg",
                "bg-gradient-to-b from-zinc-800 to-black ring-2 ring-black/85 transition-colors hover:to-zinc-900",
              )}
            >
              <Plus className="h-4 w-4" /> Content
            </button>
          }
        />
      </div>
    ) : (
      <SectionChildStack
        blocks={children}
        selectedBlockId={selectedBlockId}
        onReorder={(oldIndex, newIndex) => setChildren(arrayMove(children, oldIndex, newIndex))}
        insertMenu={(index, trigger) => (
          <SectionInsertMenu align="start" onAdd={(b) => addChildAt(b, index)} trigger={trigger} />
        )}
        suppressToolbar={(child) =>
          child.type === "columns" && columnsChrome.isInnerCellActive(child.id)
        }
        onSelectChild={(child) => {
          setColumnsLayoutEditingId((prev) => (prev !== null && prev !== child.id ? null : prev));
          if (child.type === "columns") columnsChrome.clearBlockShellSelection(child.id);
          onSelectBlock(child.id);
        }}
        onSelectChildFromNotch={(child) => {
          // Notch select keeps nested column-cell focus (no clearBlockShellSelection).
          setColumnsLayoutEditingId((prev) => (prev !== null && prev !== child.id ? null : prev));
          onSelectBlock(child.id);
        }}
        renderToolbar={(child, idx) => (
          <BlockToolbarForBlock
            scope="section-child"
            block={child}
            index={idx}
            count={children.length}
            update={(next) => updateChild(child.id, next as ProposalContentBlock)}
            remove={() => removeChild(child.id)}
            move={(direction) => moveChild(child.id, direction)}
            duplicate={() => duplicateChild(child.id)}
            getBlockStyle={getBlockStyle}
            applyBlockStyle={applyBlockStyle}
            onPatchBackground={
              child.type === "packages"
                ? (next) => {
                    const p = child as PackagesBlock;
                    if (!next) {
                      const { background: _b, ...rest } = p;
                      void _b;
                      updateChild(child.id, rest as ProposalContentBlock);
                    } else {
                      updateChild(child.id, { ...p, background: next } as ProposalContentBlock);
                    }
                  }
                : undefined
            }
            columnsLayout={
              child.type === "columns"
                ? {
                    editing: columnsLayoutEditingId === child.id,
                    onStartEdit: () => setColumnsLayoutEditingId(child.id),
                    onEndEdit: () => setColumnsLayoutEditingId(null),
                  }
                : undefined
            }
          />
        )}
        renderChild={(child) => (
          <ProposalBlockFields
            block={child}
            onChange={(next) => updateChild(child.id, next as ProposalContentBlock)}
            selection={{
              selectedId: selectedBlockId,
              onSelect: onSelectBlock,
            }}
            getBlockStyle={getBlockStyle}
            applyBlockStyle={applyBlockStyle}
            columnsLayoutEditing={{
              activeId: columnsLayoutEditingId,
              setActiveId: setColumnsLayoutEditingId,
            }}
            columnsInnerCellCallbacks={
              child.type === "columns" ? columnsChrome.callbacksFor(child.id) : undefined
            }
          />
        )}
      />
    );

  return (
    <ProposalSectionShell background={block.background} variant="editor">
      <div className="min-w-0">{sectionStack}</div>
    </ProposalSectionShell>
  );
}
