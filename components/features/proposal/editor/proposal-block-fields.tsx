"use client";

import * as React from "react";
import { arrayMove } from "@dnd-kit/sortable";
import {
  AlignCenter,
  AlignLeft,
  Check,
  Pencil,
  Plus,
  type LucideIcon,
} from "lucide-react";
import type {
  AgreementBlock,
  BlockStyle,
  ColumnsBlock,
  PackagesBlock,
  ProposalBlock,
  ProposalAgreementChildBlock,
  ProposalColumnChildBlock,
  ProposalContentBlock,
  SectionBlock,
  TextBlock,
} from "@/types/proposal";
import { ProposalRichText } from "@/components/features/proposal/rich-text/proposal-rich-text";
import { ProposalSectionShell } from "@/components/proposal/proposal-section-shell";
import {
  type ProposalIconColumnToolbarActions,
} from "@/components/proposal/proposal-icon-block-toolbar";
import { ProposalSectionBackgroundPicker } from "@/components/proposal/proposal-section-background-picker";
import { useProposalSectionEditorAppearance, useProposalSectionEditorChrome } from "@/components/proposal/proposal-section-editor-chrome";
import { BlockToolbarForBlock } from "@/components/features/proposal/editor/block-toolbar-factory";
import { SectionChildStack } from "@/components/features/proposal/editor/section-child-stack";
import {
  isRegistryCanvasBlock,
  ProposalBlockCanvas,
} from "@/components/features/proposal/editor/block-canvas";
import type { BlockMenuProfile } from "@/components/features/proposal/blocks/block-editor-registry";
import {
  columnMenuContent,
  columnMenuInteractive,
  sectionInsertOptions,
  type BlockInsertOption,
} from "@/lib/proposal/block-insert-menu";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PROPOSAL_TOOLBAR_PANEL_SURFACE_CLASSES } from "@/lib/proposal/editor-glass";
import {
  proposalAgreementCtaEditChipClasses,
  proposalEditorCanvasChipClasses,
} from "@/lib/proposal/editor-toolbar-tokens";
import { cn } from "@/lib/utils";
import {
  DEFAULT_AGREEMENT_BUTTON_COLOR,
  readableForeground,
  resolveAgreementButtonColor,
  STYLE_PRESET_COLORS,
} from "@/lib/proposal/block-style";
import { createProposalBlock } from "@/lib/proposal/block-definitions";
import { resolveSectionBackground } from "@/lib/proposal/section-background";

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `b-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Deep-clones a block and nested collections (tiers, line items, form fields). Used by the toolbar Duplicate action. */
function cloneBlockWithFreshIds(block: ProposalBlock): ProposalBlock {
  switch (block.type) {
    case "pricing":
      return {
        ...block,
        id: newId(),
        lineItems: (block.lineItems ?? []).map((li) => ({ ...li, id: newId() })),
      };
    case "packages":
      return {
        ...block,
        id: newId(),
        tiers: (block.tiers ?? []).map((t) => ({ ...t, id: newId(), features: [...(t.features ?? [])] })),
        addonLineItems: (block.addonLineItems ?? []).map((li) => ({ ...li, id: newId() })),
      };
    case "form":
      return {
        ...block,
        id: newId(),
        fields: (block.fields ?? []).map((f) => ({ ...f, id: newId(), options: f.options ? [...f.options] : undefined })),
      };
    case "accordion":
      return {
        ...block,
        id: newId(),
        panels: block.panels.map((p) => ({
          ...p,
          id: newId(),
        })),
      };
    case "columns": {
      const c = block as ColumnsBlock;
      return {
        ...c,
        id: newId(),
        stacks: c.stacks.map((stack) =>
          stack.map((child) => cloneBlockWithFreshIds(child as ProposalBlock) as ProposalColumnChildBlock),
        ),
      };
    }
    case "icon":
      return { ...block, id: newId() };
    case "splash":
      return { ...block, id: newId() };
    case "section":
      return {
        ...block,
        id: newId(),
        children: block.children.map((c) => cloneBlockWithFreshIds(c as ProposalBlock) as ProposalContentBlock),
      };
    case "agreement":
      return {
        ...block,
        id: newId(),
        children: (block as AgreementBlock).children.map(
          (c) => cloneBlockWithFreshIds(c as ProposalBlock) as ProposalAgreementChildBlock,
        ),
      };
    default:
      return { ...block, id: newId() } as ProposalBlock;
  }
}

type BlockOption = BlockInsertOption;

export const BlockMenuProfileContext = React.createContext<BlockMenuProfile>("proposal");

export function useBlockMenuProfile(): BlockMenuProfile {
  return React.useContext(BlockMenuProfileContext);
}

export type ProposalImageColumnToolbarActions = {
  onRemove: () => void;
};

export type ProposalBlockFieldsProps = {
  block: ProposalBlock;
  onChange: (next: ProposalBlock) => void;
  selection?: { selectedId: string | null; onSelect: (id: string | null) => void };
  getBlockStyle?: (b: ProposalBlock) => BlockStyle | undefined;
  applyBlockStyle?: (id: string, style: BlockStyle | undefined) => void;
  columnsLayoutEditing?: {
    activeId: string | null;
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
  };
  imageColumnToolbar?: ProposalImageColumnToolbarActions;
  iconColumnToolbar?: ProposalIconColumnToolbarActions;
  columnsInnerCellCallbacks?: {
    onInnerCellActiveChange: (cellId: string | null) => void;
    registerClearCellSelection: (clear: (() => void) | null) => void;
  };
};

function useColumnsInnerCellChrome() {
  const [activeByBlockId, setActiveByBlockId] = React.useState<Record<string, string>>({});
  const clearRef = React.useRef<Record<string, () => void>>({});

  const reportInnerCell = React.useCallback((blockId: string, cellId: string | null) => {
    setActiveByBlockId((prev) => {
      if (!cellId) {
        if (!(blockId in prev)) return prev;
        const next = { ...prev };
        delete next[blockId];
        return next;
      }
      return { ...prev, [blockId]: cellId };
    });
  }, []);

  const registerClear = React.useCallback((blockId: string, clear: (() => void) | null) => {
    if (clear) clearRef.current[blockId] = clear;
    else delete clearRef.current[blockId];
  }, []);

  const clearBlockShellSelection = React.useCallback(
    (blockId: string) => {
      clearRef.current[blockId]?.();
      reportInnerCell(blockId, null);
    },
    [reportInnerCell],
  );

  const isInnerCellActive = React.useCallback(
    (blockId: string) => Boolean(activeByBlockId[blockId]),
    [activeByBlockId],
  );

  const callbacksFor = React.useCallback(
    (blockId: string) => ({
      onInnerCellActiveChange: (cellId: string | null) => reportInnerCell(blockId, cellId),
      registerClearCellSelection: (clear: (() => void) | null) => registerClear(blockId, clear),
    }),
    [reportInnerCell, registerClear],
  );

  return { isInnerCellActive, clearBlockShellSelection, callbacksFor };
}

function DarkInsertRow({
  icon: Icon,
  label,
  onPick,
}: {
  icon: LucideIcon;
  label: string;
  onPick: () => void;
}) {
  return (
    <DropdownMenuItem
      className="cursor-pointer gap-2 rounded-none px-2.5 py-1.5 text-sm text-zinc-100 focus:bg-white/10 focus:text-white"
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        onPick();
      }}
      onSelect={(e: Event) => e.preventDefault()}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-white/[0.06] ring-1 ring-white/10">
        <Icon className="h-3 w-3 text-zinc-100" aria-hidden />
      </span>
      {label}
    </DropdownMenuItem>
  );
}

function SectionInsertMenu({
  onAdd,
  trigger,
  align = "start",
}: {
  onAdd: (block: ProposalBlock) => void;
  trigger: React.ReactNode;
  align?: "start" | "center" | "end";
}) {
  const blockMenuProfile = useBlockMenuProfile();
  const [open, setOpen] = React.useState(false);

  function pick(option: BlockOption) {
    onAdd(option.factory?.() ?? createProposalBlock(option.type));
    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={4}
        className={cn(
          "w-[min(200px,calc(100vw-2rem))] overflow-hidden rounded-lg border-zinc-800 bg-zinc-950 p-0 text-zinc-100 shadow-xl",
        )}
        onCloseAutoFocus={(event: Event) => event.preventDefault()}
      >
        <p className="px-2.5 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Content
        </p>
        <div className="pb-1">
          {sectionInsertOptions(blockMenuProfile).map((opt) => (
            <DarkInsertRow key={opt.id} icon={opt.icon} label={opt.label} onPick={() => pick(opt)} />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ColumnInsertMenu({
  onAdd,
  trigger,
  align = "start",
}: {
  onAdd: (block: ProposalBlock) => void;
  trigger: React.ReactNode;
  align?: "start" | "center" | "end";
}) {
  const blockMenuProfile = useBlockMenuProfile();
  const [open, setOpen] = React.useState(false);

  function pick(option: BlockOption) {
    onAdd(option.factory?.() ?? createProposalBlock(option.type));
    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={4}
        className={cn(
          "w-[min(220px,calc(100vw-2rem))] overflow-hidden rounded-lg border-zinc-800 bg-zinc-950 p-0 text-zinc-100 shadow-xl",
        )}
        onCloseAutoFocus={(event: Event) => event.preventDefault()}
      >
        <p className="px-2.5 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Content</p>
        <div className="pb-1">
          {columnMenuContent(blockMenuProfile).map((opt) => (
            <DarkInsertRow key={opt.id} icon={opt.icon} label={opt.label} onPick={() => pick(opt)} />
          ))}
        </div>
        {columnMenuInteractive(blockMenuProfile).length > 0 ? (
          <>
            <p className="px-2.5 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Interactive
            </p>
            <div className="pb-1">
              {columnMenuInteractive(blockMenuProfile).map((opt) => (
                <DarkInsertRow key={opt.id} icon={opt.icon} label={opt.label} onPick={() => pick(opt)} />
              ))}
            </div>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
function patchColumnStackAtIndex(
  cols: ColumnsBlock,
  columnIndex: number,
  stack: ProposalColumnChildBlock[],
): ColumnsBlock {
  return {
    ...cols,
    stacks: cols.stacks.map((s, i) => (i === columnIndex ? stack : s)),
  };
}

function findColumnCellMeta(
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

function ColumnResizeGrip({
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

function ColumnGhostText({ onSeed, placeholder }: { onSeed: (block: TextBlock) => void; placeholder: string }) {
  const idRef = React.useRef(newId());
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

function NestedColumnBlockFields({
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

function ColumnPane({
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
              if (el.closest(".tiptap") || el.closest(".ProseMirror")) markColumnContentActive();
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

  const sectionStack =
    children.length === 0 ? (
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
function agreementNormalizeColorInput(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  if (/^#?[0-9a-fA-F]{3}$/.test(v)) return `#${v.replace("#", "")}`;
  if (/^#?[0-9a-fA-F]{6}$/.test(v)) return `#${v.replace("#", "")}`;
  if (/^[a-zA-Z]{3,32}$/.test(v)) return v.toLowerCase();
  return null;
}

function agreementNormalizeHexForCompare(s: string): string {
  const v = s.trim().replace(/^#/, "").toLowerCase();
  if (v.length === 3 && /^[0-9a-f]{3}$/.test(v)) {
    return `${v[0]}${v[0]}${v[1]}${v[1]}${v[2]}${v[2]}`;
  }
  return v.length === 6 && /^[0-9a-f]{6}$/.test(v) ? v : "";
}

function agreementSwatchIsActive(swatch: string, current: string): boolean {
  const a = agreementNormalizeHexForCompare(swatch);
  const b = agreementNormalizeHexForCompare(current);
  return a !== "" && b !== "" && a === b;
}

function agreementHexForNativeColorInput(hex: string): string {
  const v = hex.trim().replace(/^#/, "");
  if (v.length === 3 && /^[0-9a-fA-F]{3}$/.test(v)) {
    return `#${v[0]}${v[0]}${v[1]}${v[1]}${v[2]}${v[2]}`.toLowerCase();
  }
  if (v.length === 6 && /^[0-9a-fA-F]{6}$/.test(v)) return `#${v.toLowerCase()}`;
  return DEFAULT_AGREEMENT_BUTTON_COLOR;
}

function agreementNeedsLightCheck(hex: string): boolean {
  if (hex.toUpperCase() === "#FFFFFF" || hex.toUpperCase() === "#FFF") return false;
  if (hex.toUpperCase() === "#E2E8F0") return false;
  return true;
}

function AgreementSignButtonPreview({
  block,
  onChange,
}: {
  block: AgreementBlock;
  onChange: (next: AgreementBlock) => void;
}) {
  const ctaColor = resolveAgreementButtonColor(block.style);
  const fg = readableForeground(ctaColor);
  const label = block.buttonLabel?.trim() || "View Agreement";
  const align = block.buttonAlign ?? "center";
  const [hexDraft, setHexDraft] = React.useState(ctaColor);
  const sectionAppearance = useProposalSectionEditorAppearance();
  React.useEffect(() => setHexDraft(ctaColor), [ctaColor]);

  function commitHexDraft() {
    const next = agreementNormalizeColorInput(hexDraft);
    if (next) {
      onChange({ ...block, style: { ...block.style, primaryColor: next } });
      setHexDraft(next);
    } else {
      setHexDraft(ctaColor);
    }
  }

  function setPrimaryColor(next: string) {
    onChange({ ...block, style: { ...block.style, primaryColor: next } });
  }

  return (
    <Popover>
      <div className={cn("flex w-full", align === "start" ? "justify-start" : "justify-center")}>
        <div className="group/agreement-cta relative inline-flex max-w-full">
          <div
            className="inline-flex h-10 min-w-0 max-w-full items-center justify-center rounded-lg px-5 text-sm font-semibold shadow-sm"
            style={{ backgroundColor: ctaColor, color: fg }}
          >
            <span className="truncate">{label}</span>
          </div>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "absolute -right-1.5 -top-1.5",
                proposalAgreementCtaEditChipClasses(sectionAppearance),
              )}
              aria-label="Edit sign button"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
            </button>
          </PopoverTrigger>
        </div>
      </div>
      <PopoverContent className="w-80 p-4" align="end" side="right" sideOffset={10} collisionPadding={16}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`agreement-button-text-${block.id}`}>Button text</Label>
            <Input
              id={`agreement-button-text-${block.id}`}
              value={block.buttonLabel ?? ""}
              placeholder="View Agreement"
              maxLength={80}
              onChange={(e) => onChange({ ...block, buttonLabel: e.target.value })}
            />
          </div>
          <div>
            <p className="px-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Button color
            </p>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {STYLE_PRESET_COLORS.map((c) => {
                const isActive = agreementSwatchIsActive(c.value, ctaColor);
                return (
                  <button
                    key={c.value}
                    type="button"
                    aria-label={c.label}
                    title={c.label}
                    onClick={() => setPrimaryColor(c.value)}
                    className={cn(
                      "relative h-8 w-8 rounded-full border border-border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : "hover:scale-105",
                    )}
                    style={{ backgroundColor: c.value }}
                  >
                    {isActive ? (
                      <Check
                        className={cn(
                          "absolute inset-0 m-auto h-4 w-4",
                          agreementNeedsLightCheck(c.value) ? "text-white" : "text-zinc-900",
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-1.5">
              <input
                type="color"
                aria-label="Pick button colour"
                value={agreementHexForNativeColorInput(ctaColor)}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0"
              />
              <Input
                type="text"
                value={hexDraft}
                onChange={(e) => setHexDraft(e.target.value)}
                onBlur={commitHexDraft}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                spellCheck={false}
                className="h-8 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                aria-label="Button colour hex value"
                placeholder="#15141F"
              />
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...block, style: undefined })}
              className="mt-2 w-full rounded-md border border-border px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Reset to default
            </button>
          </div>
          <div>
            <p className="px-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alignment</p>
            <div className="mt-2 inline-flex rounded-lg border border-border p-0.5">
              <button
                type="button"
                aria-pressed={align === "start"}
                onClick={() => onChange({ ...block, buttonAlign: "start" })}
                className={cn(
                  "inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors",
                  align === "start"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-label="Align button left"
              >
                <AlignLeft className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-pressed={align === "center"}
                onClick={() => onChange({ ...block, buttonAlign: undefined })}
                className={cn(
                  "inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors",
                  align === "center"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-label="Align button center"
              >
                <AlignCenter className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Accept block settings: CTA preview (pencil popover). Contract template is chosen from
 * “Edit agreement”; e-sign, payment-in-modal, and acceptance options from the circular e-sign control on the toolbar.
 */
function AgreementBlockEditor({
  block,
  onChange,
}: {
  block: AgreementBlock;
  onChange: (next: AgreementBlock) => void;
}) {
  return (
    <div className="space-y-4">
      <AgreementSignButtonPreview block={block} onChange={onChange} />
    </div>
  );
}

export function AgreementBlockFields({
  block,
  onChange,
  selectedBlockId,
  onSelectBlock,
  getBlockStyle,
  applyBlockStyle,
}: {
  block: AgreementBlock;
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

  function setChildren(nextChildren: ProposalAgreementChildBlock[]) {
    onChange({ ...block, children: nextChildren });
  }

  function updateChild(childId: string, next: ProposalAgreementChildBlock) {
    setChildren(children.map((c) => (c.id === childId ? next : c)));
  }

  function removeChild(childId: string) {
    setChildren(children.filter((c) => c.id !== childId));
    if (selectedBlockId === childId) onSelectBlock(null);
    if (columnsLayoutEditingId === childId) setColumnsLayoutEditingId(null);
  }

  function addChildAt(b: ProposalBlock, index: number) {
    if (b.type === "agreement") return;
    const c = b as ProposalAgreementChildBlock;
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
    const cloned = cloneBlockWithFreshIds(children[idx] as ProposalBlock) as ProposalAgreementChildBlock;
    const next = [...children];
    next.splice(idx + 1, 0, cloned);
    setChildren(next);
    onSelectBlock(null);
  }

  const resolvedBg = resolveSectionBackground(block.background);
  const backdropOn = resolvedBg.active;

  const acceptStack =
    children.length === 0 ? (
      <div className="flex flex-col items-center gap-5 py-14 text-center">
        <div className="max-w-[20rem] space-y-1">
          <p className="text-sm font-medium text-foreground">Accept surface</p>
          <p className="text-xs text-muted-foreground">
            Add headings, prose, columns, dividers, and spacers above the sign button — the same building blocks as in a
            Section.
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
            update={(next) => updateChild(child.id, next as ProposalAgreementChildBlock)}
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
                      updateChild(child.id, rest as ProposalAgreementChildBlock);
                    } else {
                      updateChild(child.id, { ...p, background: next } as ProposalAgreementChildBlock);
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
            onChange={(next) => updateChild(child.id, next as ProposalAgreementChildBlock)}
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

  const settingsFooter = (
    <div className="w-full px-2 pb-4 pt-4 sm:px-3">
      <AgreementBlockEditor block={block} onChange={(next) => onChange(next)} />
    </div>
  );

  return (
    <ProposalSectionShell background={block.background} variant="editor">
      {backdropOn ? (
        // Horizontal inset is applied once by the editor section shell.
        <div className="flex min-w-0 flex-col">
          {acceptStack}
          {settingsFooter}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/65 bg-muted/15 px-1 py-1 sm:bg-muted/[0.35]">
          <div className="flex min-w-0 flex-col">
            {acceptStack}
            {settingsFooter}
          </div>
        </div>
      )}
    </ProposalSectionShell>
  );
}
export { useColumnsInnerCellChrome };

export function ProposalBlockFields({
  block,
  onChange,
  selection,
  getBlockStyle,
  applyBlockStyle,
  columnsLayoutEditing,
  columnsInnerCellCallbacks,
  imageColumnToolbar,
  iconColumnToolbar,
}: ProposalBlockFieldsProps) {
  const sectionChrome = useProposalSectionEditorChrome();
  const seamlessSection = sectionChrome?.seamless ?? false;

  return (
    <ProposalBlockCanvas
      block={block}
      onChange={onChange}
      selectedBlockId={selection?.selectedId}
      onSelectBlock={selection?.onSelect}
      seamlessSection={seamlessSection}
      editableSurface={seamlessSection ? "section-child" : null}
      imageColumnToolbar={imageColumnToolbar}
      iconColumnToolbar={iconColumnToolbar}
      getBlockStyle={getBlockStyle}
      applyBlockStyle={applyBlockStyle}
      columnsLayoutEditing={columnsLayoutEditing}
      columnsInnerCellCallbacks={columnsInnerCellCallbacks}
    />
  );
}
