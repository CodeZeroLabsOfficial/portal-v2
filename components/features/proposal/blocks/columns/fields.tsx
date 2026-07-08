"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import type {
  ColumnsBlock,
  PackagesBlock,
  ProposalBlock,
  ProposalColumnChildBlock,
  TextBlock,
} from "@/types/proposal";
import { ProposalRichText } from "@/components/features/proposal/rich-text/proposal-rich-text";
import {
  type ProposalIconColumnToolbarActions,
} from "@/components/features/proposal/blocks/icon/icon-block-toolbar";
import { ProposalSectionBackgroundPicker } from "@/components/features/proposal/editor/background/section-background-picker";
import { useProposalSectionEditorAppearance } from "@/components/features/proposal/editor/section-chrome/proposal-section-editor-chrome";
import {
  isRegistryCanvasBlock,
  ProposalBlockCanvas,
} from "@/components/features/proposal/editor/block-canvas";
import { ColumnInsertMenu } from "@/components/features/proposal/editor/block-insert-menus";
import { newBlockId } from "@/components/features/proposal/editor/block-field-utils";
import {
  ProposalBlockFields,
  type ProposalImageColumnToolbarActions,
} from "@/components/features/proposal/editor/proposal-block-fields";
import {
  clampFr,
  ColumnLayoutCount,
  coerceColumnFlex,
  columnFlexPercents,
  columnsBlockMdGapX,
  columnsBlockMdItemsClass,
  normalizeColumnFlexForStorage,
  PROPOSAL_COLUMN_FR_MIN,
} from "@/lib/proposal/columns";
import { PROPOSAL_DOCUMENT_COLUMNS_ROW_GAP_CLASSES } from "@/lib/proposal/public/public-layout";
import { PROPOSAL_TOOLBAR_PANEL_SURFACE_CLASSES } from "@/lib/proposal/editor-glass";
import { proposalEditorCanvasChipClasses } from "@/lib/proposal/editor-toolbar-tokens";
import { cn } from "@/lib/utils";

export function patchColumnStackAtIndex(
  cols: ColumnsBlock,
  columnIndex: number,
  stack: ProposalColumnChildBlock[],
): ColumnsBlock {
  return {
    ...cols,
    stacks: cols.stacks.map((s, i) => (i === columnIndex ? stack : s)),
  };
}

export function findColumnCellMeta(
  col: ColumnsBlock,
  cellId: string | null,
): { ci: number; si: number; child: ProposalColumnChildBlock } | null {
  if (!cellId) return null;
  for (let ci = 0; ci < col.stacks.length; ci++) {
    const si = col.stacks[ci].findIndex((c) => c.id === cellId);
    if (si >= 0) return { ci, si, child: col.stacks[ci][si] };
  }
  return null;
}

export function ColumnResizeGrip({
  gripped,
  onPointerDown,
}: {
  gripped: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className="relative z-10 hidden w-3 shrink-0 cursor-col-resize select-none touch-none md:block"
      onPointerDown={onPointerDown}
    >
      <div className="flex h-full min-h-[100px] w-full cursor-col-resize items-center justify-center">
        <div
          className={cn(
            "min-h-[3rem] w-1 rounded-full transition-colors",
            gripped ? "bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.45)]" : "bg-sky-500/85",
          )}
          aria-hidden
        />
      </div>
    </div>
  );
}

export function ColumnGhostText({ onSeed, placeholder }: { onSeed: (block: TextBlock) => void; placeholder: string }) {
  const idRef = React.useRef(newBlockId());
  const [html, setHtml] = React.useState("<p></p>");
  return (
    <ProposalRichText
      html={html}
      placeholder={placeholder}
      onChange={(next) => {
        setHtml(next);
        onSeed({ id: idRef.current, type: "text", html: next, body: undefined });
      }}
    />
  );
}

export function NestedColumnBlockFields({
  block,
  onChange,
  textPlaceholder,
  cellSelection,
  imageColumnToolbar,
  iconColumnToolbar,
}: {
  block: ProposalColumnChildBlock;
  onChange: (next: ProposalColumnChildBlock) => void;
  /** Rich-text placeholder when this block is a column cell (Qwilr-style hint). */
  textPlaceholder?: string;
  /** Which cell in the columns layout is active (for image toolbar visibility). */
  cellSelection?: { selectedId: string | null; onSelect: (id: string | null) => void };
  /** When this cell is an image: remove action is shown on the image toolbar. */
  imageColumnToolbar?: ProposalImageColumnToolbarActions;
  /** When this cell is an icon: picker + remove are shown on the floating toolbar. */
  iconColumnToolbar?: ProposalIconColumnToolbarActions;
}) {
  const patchNested = (next: ProposalBlock) => onChange(next as ProposalColumnChildBlock);
  const registryCanvas = (
    <ProposalBlockCanvas
      block={block as ProposalBlock}
      onChange={patchNested}
      selectedBlockId={cellSelection?.selectedId}
      editableSurface="column-cell"
      textPlaceholder={textPlaceholder}
      imageColumnToolbar={block.type === "image" ? imageColumnToolbar : undefined}
      iconColumnToolbar={block.type === "icon" ? iconColumnToolbar : undefined}
      onSelectBlock={(id) => cellSelection?.onSelect(id)}
    />
  );
  if (isRegistryCanvasBlock(block.type)) {
    return registryCanvas;
  }
  switch (block.type) {
    default:
      return (
        <ProposalBlockFields
          block={block as ProposalBlock}
          onChange={patchNested}
          imageColumnToolbar={block.type === "image" ? imageColumnToolbar : undefined}
          iconColumnToolbar={block.type === "icon" ? iconColumnToolbar : undefined}
          selection={cellSelection}
        />
      );
  }
}

export function ColumnPane({
  label,
  columnIndex,
  stack,
  onPatchColumnStack,
  selectedCellId,
  setSelectedCellId,
  setActiveColumnIndex,
}: {
  label: string;
  columnIndex: number;
  stack: ProposalColumnChildBlock[];
  onPatchColumnStack: (columnIndex: number, nextStack: ProposalColumnChildBlock[]) => void;
  selectedCellId: string | null;
  setSelectedCellId: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveColumnIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  function setStack(next: ProposalColumnChildBlock[]) {
    onPatchColumnStack(columnIndex, next);
  }
  function removeAt(id: string) {
    setSelectedCellId((cur) => (cur === id ? null : cur));
    setStack(stack.filter((x) => x.id !== id));
  }
  function updateChild(childId: string, nextChild: ProposalColumnChildBlock) {
    setStack(stack.map((c) => (c.id === childId ? nextChild : c)));
  }
  const cellSelection = React.useMemo(
    () => ({ selectedId: selectedCellId, onSelect: setSelectedCellId }),
    [selectedCellId, setSelectedCellId],
  );
  return (
    <div
      className="min-w-0"
      onClick={(e) => e.stopPropagation()}
      onPointerDownCapture={() => {
        setActiveColumnIndex(columnIndex);
        if (stack.length === 0) setSelectedCellId(null);
      }}
    >
      <span className="sr-only">{label}</span>
      <div className="min-w-0 space-y-4">
        {stack.length === 0 ? (
          <ColumnGhostText
            placeholder="Type / to add content"
            onSeed={(tb) => setStack([tb])}
          />
        ) : (
          stack.map((child) => {
            const cellSelected = selectedCellId === child.id;
            return (
              <div
                key={child.id}
                className={cn(
                  "-m-1 space-y-2 rounded-sm p-1 transition-[box-shadow] duration-150",
                  cellSelected && "ring-1 ring-sky-500/70",
                )}
                onPointerDownCapture={(e) => {
                  if ((e.target as HTMLElement).closest("[data-proposal-column-cell-content]")) return;
                  setSelectedCellId(child.id);
                  setActiveColumnIndex(columnIndex);
                }}
              >
                <NestedColumnBlockFields
                  block={child}
                  onChange={(n) => updateChild(child.id, n)}
                  textPlaceholder="Type / to add content"
                  cellSelection={cellSelection}
                  imageColumnToolbar={
                    child.type === "image"
                      ? {
                          onRemove: () => removeAt(child.id),
                        }
                      : undefined
                  }
                  iconColumnToolbar={
                    child.type === "icon"
                      ? {
                          onRemove: () => removeAt(child.id),
                        }
                      : undefined
                  }
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function ColumnsBlockFields({
  block,
  onChange,
  resizeLayoutActive,
  onExitResizeLayout,
  ancestorSelectedBlockId,
  onInnerCellActiveChange,
  registerClearCellSelection,
}: {
  block: ColumnsBlock;
  onChange: (next: ColumnsBlock) => void;
  resizeLayoutActive?: boolean;
  onExitResizeLayout?: () => void;
  /** Section/root selected block id — used to clear inner column cell selection when focus leaves this columns block. */
  ancestorSelectedBlockId: string | null;
  /** Notifies parent when a column cell (text, icon, etc.) is active — suppresses block toolbar. */
  onInnerCellActiveChange?: (cellId: string | null) => void;
  /** Parent can clear cell selection when the columns block shell is selected. */
  registerClearCellSelection?: (clear: (() => void) | null) => void;
}) {
  const columnCount = block.stacks.length as ColumnLayoutCount;
  const resizeMode = Boolean(resizeLayoutActive);
  const columnWidthRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const blockRef = React.useRef(block);
  blockRef.current = block;
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const [dragDividerIndex, setDragDividerIndex] = React.useState<number | null>(null);
  const [selectedCellId, setSelectedCellIdState] = React.useState<string | null>(null);
  const [activeColumnIndex, setActiveColumnIndex] = React.useState(0);
  const selectedCellIdRef = React.useRef(selectedCellId);
  selectedCellIdRef.current = selectedCellId;
  const onInnerCellActiveRef = React.useRef(onInnerCellActiveChange);
  onInnerCellActiveRef.current = onInnerCellActiveChange;
  const sectionAppearance = useProposalSectionEditorAppearance();

  const reportInnerCellActive = React.useCallback((cellId: string | null) => {
    onInnerCellActiveRef.current?.(cellId);
  }, []);

  const setSelectedCellId = React.useCallback(
    (value: React.SetStateAction<string | null>) => {
      setSelectedCellIdState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        reportInnerCellActive(next);
        return next;
      });
    },
    [reportInnerCellActive],
  );

  const markColumnContentActive = React.useCallback(() => {
    reportInnerCellActive(selectedCellIdRef.current ?? "__content__");
  }, [reportInnerCellActive]);

  React.useEffect(() => {
    setActiveColumnIndex((i) =>
      block.stacks.length <= 0 ? 0 : Math.min(Math.max(0, i), block.stacks.length - 1),
    );
  }, [block.stacks.length]);

  const selectedCellMeta = React.useMemo(
    () => findColumnCellMeta(block, selectedCellId),
    [block, selectedCellId],
  );

  React.useEffect(() => {
    if (ancestorSelectedBlockId != null && ancestorSelectedBlockId !== block.id) {
      setSelectedCellId(null);
    }
  }, [ancestorSelectedBlockId, block.id, setSelectedCellId]);

  React.useEffect(() => {
    registerClearCellSelection?.(() => setSelectedCellId(null));
    return () => registerClearCellSelection?.(null);
  }, [registerClearCellSelection, setSelectedCellId]);

  React.useEffect(() => {
    const ids = new Set(block.stacks.flatMap((s) => s.map((c) => c.id)));
    if (selectedCellId && !ids.has(selectedCellId)) setSelectedCellId(null);
  }, [block.stacks, selectedCellId, setSelectedCellId]);

  React.useEffect(() => {
    if (!resizeMode) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExitResizeLayout?.();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [resizeMode, onExitResizeLayout]);

  React.useEffect(() => {
    if (dragDividerIndex === null) return;
    const di = dragDividerIndex;

    function applyFromClientX(clientX: number) {
      const elL = columnWidthRefs.current[di];
      const elR = columnWidthRefs.current[di + 1];
      if (!elL || !elR) return;
      const rl = elL.getBoundingClientRect();
      const rr = elR.getBoundingClientRect();
      const span = rr.right - rl.left;
      if (span < 40) return;
      let t = (clientX - rl.left) / span;
      t = Math.min(0.93, Math.max(0.07, t));
      const b = blockRef.current;
      const weights = coerceColumnFlex(b.stacks.length, b.columnFlex);
      const pair = weights[di] + weights[di + 1];
      const newLeftUnclamped = t * pair;
      const newLeft = Math.min(pair - PROPOSAL_COLUMN_FR_MIN, Math.max(PROPOSAL_COLUMN_FR_MIN, newLeftUnclamped));
      const newRight = pair - newLeft;
      const next = [...weights];
      next[di] = clampFr(newLeft);
      next[di + 1] = clampFr(newRight);
      onChangeRef.current({
        ...b,
        columnFlex: normalizeColumnFlexForStorage(next.length, next),
      });
    }

    function onMove(e: PointerEvent) {
      applyFromClientX(e.clientX);
    }
    function onUp(e: PointerEvent) {
      applyFromClientX(e.clientX);
      setDragDividerIndex(null);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragDividerIndex]);

  const flexRow = coerceColumnFlex(columnCount, block.columnFlex);
  const flexPercents = resizeMode ? columnFlexPercents(flexRow) : [];

  return (
    <div className="space-y-6">
      {resizeMode ? (
        <div className="space-y-1.5">
          <p className="text-center text-xs font-medium text-sky-600 dark:text-sky-300 md:text-left">
            Drag the blue lines to adjust width — Done when finished.
          </p>
          <p className="text-center text-sm font-semibold tracking-tight tabular-nums text-sky-950 dark:text-sky-50 md:text-left">
            {flexPercents.map((p) => `${p}%`).join(" · ")}
          </p>
        </div>
      ) : null}

      {(() => {
        const pad =
          typeof block.insetPaddingPx === "number" && Number.isFinite(block.insetPaddingPx)
            ? Math.min(64, Math.max(0, Math.round(block.insetPaddingPx)))
            : 0;
        const gapClasses = columnsBlockMdGapX(block.columnGap, columnCount);
        const gapClassesEffective = resizeMode ? "md:gap-x-0" : gapClasses;
        const itemsClasses = columnsBlockMdItemsClass(block.rowAlign);
        const columnRow = (
          <div
            data-proposal-columns-content
            onPointerDownCapture={markColumnContentActive}
            onFocusCapture={(e) => {
              const el = e.target as HTMLElement;
              if (el.closest(".ProseMirror")) markColumnContentActive();
            }}
            className={cn(
              "flex flex-col gap-6 md:flex-row",
              PROPOSAL_DOCUMENT_COLUMNS_ROW_GAP_CLASSES,
              gapClassesEffective,
              itemsClasses,
              resizeMode &&
                "rounded-xl border-2 border-dashed border-sky-500/55 bg-sky-500/[0.03] py-1 dark:border-sky-400/50 dark:bg-sky-950/15",
            )}
          >
            {block.stacks.map((stack, i) => {
              const showPlansHere =
                !resizeMode &&
                selectedCellMeta?.child.type === "packages" &&
                selectedCellMeta.ci === i;
              const mountColumnLeftRail = !resizeMode;
              return (
              <React.Fragment key={`${block.id}-col-${i}`}>
                <div
                  ref={(el) => {
                    columnWidthRefs.current[i] = el;
                  }}
                  onPointerDownCapture={() => setActiveColumnIndex(i)}
                  className={cn(
                    "relative min-w-0 md:min-w-[3.5rem]",
                    !resizeMode &&
                      cn(
                        "group/colcell rounded-md border border-transparent p-1 md:p-2",
                        "transition-[border-color,box-shadow,background-color] duration-150 ease-out",
                        "hover:border-border/65 hover:bg-muted/25 hover:shadow-sm",
                        "focus-within:border-border/80 focus-within:bg-muted/20 focus-within:shadow-sm",
                        "dark:hover:bg-muted/15 dark:focus-within:bg-muted/15",
                      ),
                    resizeMode &&
                      "rounded-lg border border-sky-400/40 bg-background/60 py-1 ring-1 ring-sky-500/20 dark:bg-background/40 md:px-0 md:py-1",
                  )}
                  style={{ flex: `${flexRow[i]} 1 0%` } as React.CSSProperties}
                >
                  {mountColumnLeftRail ? (
                    <div
                      className={cn(
                        "pointer-events-none absolute left-0 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2",
                        "invisible opacity-0 transition-opacity duration-150",
                        "group-hover/colcell:visible group-hover/colcell:opacity-100",
                        "group-focus-within/colcell:visible group-focus-within/colcell:opacity-100",
                        "has-[[data-state=open]]:visible has-[[data-state=open]]:opacity-100",
                        showPlansHere && "visible opacity-100",
                      )}
                    >
                      <div
                        className={cn(
                          "pointer-events-none flex flex-col items-center gap-2",
                          "group-hover/colcell:pointer-events-auto",
                          "group-focus-within/colcell:pointer-events-auto",
                          "has-[[data-state=open]]:pointer-events-auto",
                          showPlansHere && "pointer-events-auto",
                        )}
                      >
                        <ColumnInsertMenu
                          onAdd={(insert) => {
                            const st = block.stacks[i];
                            if (!st) return;
                            onChange(
                              patchColumnStackAtIndex(block, i, [
                                ...st,
                                insert as ProposalColumnChildBlock,
                              ]),
                            );
                          }}
                          align="start"
                          trigger={
                            <button
                              type="button"
                              className={proposalEditorCanvasChipClasses(sectionAppearance)}
                              aria-label="Add content"
                              title={`Add block to column ${i + 1}`}
                            >
                              <Plus className="h-4 w-4" aria-hidden />
                            </button>
                          }
                        />
                        {showPlansHere ? (
                          <div
                            className={cn(
                              "w-[min(14rem,calc(100vw-3rem))] space-y-1.5 rounded-xl p-2.5",
                              PROPOSAL_TOOLBAR_PANEL_SURFACE_CLASSES,
                            )}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Plans background
                            </span>
                            <ProposalSectionBackgroundPicker
                              background={(selectedCellMeta.child as PackagesBlock).background}
                              onChange={(next) => {
                                const { ci, child } = selectedCellMeta;
                                const st = block.stacks[ci];
                                const nextSt = st.map((c) => {
                                  if (c.id !== child.id) return c;
                                  const p = c as PackagesBlock;
                                  if (!next) {
                                    const { background: _b, ...rest } = p;
                                    void _b;
                                    return rest as ProposalColumnChildBlock;
                                  }
                                  return { ...p, background: next } as ProposalColumnChildBlock;
                                });
                                onChange(patchColumnStackAtIndex(block, ci, nextSt));
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  <ColumnPane
                    label={`Column ${i + 1}`}
                    columnIndex={i}
                    stack={stack}
                    onPatchColumnStack={(ci, nextStack) => onChange(patchColumnStackAtIndex(block, ci, nextStack))}
                    selectedCellId={selectedCellId}
                    setSelectedCellId={setSelectedCellId}
                    setActiveColumnIndex={setActiveColumnIndex}
                  />
                </div>
                {resizeMode && i < block.stacks.length - 1 ? (
                  <ColumnResizeGrip
                    gripped={dragDividerIndex === i}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragDividerIndex(i);
                    }}
                  />
                ) : null}
              </React.Fragment>
              );
            })}
          </div>
        );
        const chromedColumns = <div className="min-w-0">{columnRow}</div>;
        if (pad <= 0) return chromedColumns;
        return (
          <div className="rounded-lg" style={{ padding: pad }}>
            {chromedColumns}
          </div>
        );
      })()}
    </div>
  );
}
