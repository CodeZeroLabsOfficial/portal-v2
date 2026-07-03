"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlignCenter,
  AlignLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Coins,
  CreditCard,
  FileSignature,
  GripVertical,
  Heading,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  ListTree,
  Minus,
  MonitorPlay,
  MoveVertical,
  Mountain,
  Package,
  Pencil,
  PenLine,
  Plus,
  RefreshCw,
  ScrollText,
  SeparatorHorizontal,
  SquarePen,
  Star,
  type LucideIcon,
} from "lucide-react";
import type {
  AccordionBlock,
  AgreementBlock,
  AgreementSubscriptionStartDateMode,
  BlockStyle,
  ColumnsBlock,
  HeaderBlock,
  ImageBlock,
  PackagesBlock,
  ProposalBlock,
  ProposalAgreementChildBlock,
  ProposalColumnChildBlock,
  ProposalContentBlock,
  SectionBackground,
  SectionBlock,
  SplashBlock,
  TextBlock,
} from "@/types/proposal";
import { ProposalRichText } from "@/components/proposal/proposal-rich-text";
import { ProposalSectionShell } from "@/components/proposal/proposal-section-shell";
import { PROPOSAL_CANVAS_SURFACE_LIGHT_CLASSES } from "@/lib/proposal/editor-surface-tokens";
import {
  useProposalContractTemplateLibraryOptional,
  type ContractTemplatePick,
} from "@/components/proposal/proposal-contract-template-library";
import {
  type ProposalIconColumnToolbarActions,
} from "@/components/proposal/proposal-icon-block-toolbar";
import { ProposalImageBlockToolbar } from "@/components/proposal/proposal-image-block-toolbar";
import { ProposalSectionBackgroundPicker } from "@/components/proposal/proposal-section-background-picker";
import { useProposalSectionEditorChrome } from "@/components/proposal/proposal-section-editor-chrome";
import {
  SectionChildBlockGutter,
  SectionChildDragHandle,
  SECTION_CHILD_GUTTER_INSET_CLASSES,
  SectionChildInsertSlot,
} from "@/components/proposal/proposal-section-child-chrome";
import {
  SectionChildFloatingGutterProvider,
  useRegisterSectionChildFloatingRow,
  useSectionChildFloatingGutterOptional,
} from "@/components/proposal/section-child-floating-gutter";
import { ProposalBlockToolbar } from "@/components/proposal/proposal-block-toolbar";
import { ColumnsBlockLayoutControls } from "@/components/proposal/columns-block-layout-controls";
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
  AGREEMENT_SUBSCRIPTION_START_DATE_MODE_OPTIONS,
  defaultAgreementSubscriptionStartCustomDate,
} from "@/lib/agreement/subscription-start-date";
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
import { proposalBlockRendersFlushEditorBand } from "@/lib/proposal/blocks";
import {
  PROPOSAL_DOCUMENT_COLUMNS_ROW_GAP_CLASSES,
  PROPOSAL_EDITOR_BLOCK_CANVAS_INNER_CLASSES,
  PROPOSAL_EDITOR_SECTION_INNER_PAD_CLASSES,
  PROPOSAL_EDITOR_SECTION_STACK_BOTTOM_PAD_CLASSES,
  PROPOSAL_EDITOR_SECTION_STACK_GAP_CLASSES,
  proposalEditorSectionChildEdgePadClasses,
} from "@/lib/proposal/public/public-layout";
import { ContractTemplateAgreementPreview } from "@/components/features/templates/contract-template-agreement-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PROPOSAL_TOOLBAR_PANEL_SURFACE_CLASSES } from "@/lib/proposal/editor-glass";
import { cn } from "@/lib/utils";
import {
  DEFAULT_AGREEMENT_BUTTON_COLOR,
  readableForeground,
  resolveAgreementButtonColor,
  STYLE_PRESET_COLORS,
} from "@/lib/proposal/block-style";
import { packagesAddonsSectionActive } from "@/lib/proposal/commerce/packages-totals";
import { createProposalBlock } from "@/lib/proposal/block-definitions";
import { resolveSectionBackground } from "@/lib/proposal/section-background";
import { ProposalSplashBackgroundPickerWithBranding } from "@/components/proposal/proposal-splash-editor";
import { EditorTemplatePricingReadOnlyContext } from "@/components/proposal/editor-catalog-services-context";
import { getBlockDefinition } from "@/components/features/proposal/blocks/block-editor-registry";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

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

function SortableShell({
  id,
  children,
  selected,
  onSelect,
  toolbar,
  /** When false, the floating toolbar shows only while the block is selected (not on hover). Used for image blocks. */
  toolbarShowOnHover = true,
  /** Full-bleed section bands stack flush — no vertical padding on the sortable wrapper. */
  flush = false,
  /** Qwilr-style row inside a section: left drag notch + inline toolbar when selected. */
  layout = "default",
  /** Hide block toolbar while editing nested content (e.g. column cell rich text). */
  suppressToolbar = false,
  /** Drag notch: select row without clearing nested column cell focus (columns blocks). */
  onSelectFromNotch,
  /** Section-child row: `+` beside the drag notch (insert below this block). */
  sectionChildInsertMenu,
  /** Root-level block outside a section — remap tokens for dark admin chrome over a light canvas. */
  rootLightSurface = false,
}: {
  id: string;
  children: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  onSelectFromNotch?: () => void;
  sectionChildInsertMenu?: (plusTrigger: React.ReactNode) => React.ReactNode;
  toolbar?: (ctx: {
    dragAttributes: DraggableAttributes;
    dragListeners: DraggableSyntheticListeners;
  }) => React.ReactNode;
  toolbarShowOnHover?: boolean;
  flush?: boolean;
  layout?: "default" | "section-child";
  suppressToolbar?: boolean;
  rootLightSurface?: boolean;
}) {
  const [hovered, setHovered] = React.useState(false);
  const rowElRef = React.useRef<HTMLDivElement | null>(null);
  const floatingGutter = useSectionChildFloatingGutterOptional();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const sectionChrome = useProposalSectionEditorChrome();
  const seamless = sectionChrome?.seamless ?? false;
  const prefersLightSection = sectionChrome?.prefersLight ?? false;
  const flushEdges = flush ?? seamless;
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
  const showToolbar = Boolean(
    toolbar && !suppressToolbar && (selected || (toolbarShowOnHover && hovered)),
  );
  const showSectionGutter = sectionChild && !useFloatingGutter && (hovered || selected || isDragging);

  const sectionChildRingClasses = prefersLightSection
    ? cn(
        "rounded-sm ring-1 ring-offset-0 transition-[box-shadow] duration-150",
        selected || isDragging
          ? "ring-white/45"
          : hovered
            ? "ring-white/35"
            : "ring-transparent",
      )
    : cn(
        "rounded-sm ring-1 ring-offset-0 transition-[box-shadow] duration-150",
        selected || isDragging
          ? "ring-sky-500/70"
          : hovered
            ? "ring-border/55"
            : "ring-transparent",
      );

  const ringClasses = seamless
    ? cn(
        "transition-none",
        sectionChild
          ? sectionChildRingClasses
          : selected
            ? prefersLightSection
              ? "rounded-sm ring-1 ring-white/40 ring-offset-0"
              : "rounded-sm ring-1 ring-sky-500/70 ring-offset-0"
            : "rounded-sm",
        "!bg-transparent hover:!bg-transparent focus-within:!bg-transparent active:!bg-transparent",
        "dark:!bg-transparent dark:hover:!bg-transparent dark:focus-within:!bg-transparent dark:active:!bg-transparent",
      )
    : cn(
        "transition-colors",
        selected
          ? "rounded-sm ring-1 ring-primary/45 ring-offset-2 ring-offset-transparent"
          : sectionChild
            ? sectionChildRingClasses
            : "rounded-[2px] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]",
      );

  return (
    <div
      ref={useFloatingGutter ? setRowRef : setNodeRef}
      style={style}
      data-section-child-row={useFloatingGutter ? id : undefined}
      className={cn(
        "group/sortblock relative scroll-mt-28",
        sectionChild && !useFloatingGutter && "flex w-full",
        sectionChild &&
          !useFloatingGutter &&
          "focus-within:[&_[data-section-drag-gutter]]:pointer-events-auto focus-within:[&_[data-section-drag-gutter]]:visible focus-within:[&_[data-section-drag-gutter]]:opacity-100",
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
      {sectionChild && sectionChildInsertMenu && !useFloatingGutter ? (
        <SectionChildBlockGutter
          visible={showSectionGutter}
          insertMenu={sectionChildInsertMenu}
          dragHandle={
            <SectionChildDragHandle
              aria-label="Drag to reorder"
              onPointerDown={() => (onSelectFromNotch ?? onSelect)()}
              {...attributes}
              {...listeners}
            />
          }
        />
      ) : null}
      <div className={cn("relative min-w-0", sectionChild ? "flex-1" : "w-full")}>
        {showToolbar && toolbar && !sectionChild ? (
          <div className="pointer-events-none absolute left-0 top-0 z-30 -translate-y-full pb-1.5 pt-2 sm:left-2">
            <div className="pointer-events-auto">
              {toolbar({ dragAttributes: attributes, dragListeners: listeners })}
            </div>
          </div>
        ) : null}
        {showToolbar && toolbar && sectionChild ? (
          <div className="pointer-events-none absolute right-0 top-0 z-50 -translate-y-full pb-1.5 pt-0.5">
            <div className="pointer-events-auto">
              {toolbar({ dragAttributes: attributes, dragListeners: listeners })}
            </div>
          </div>
        ) : null}
        <div
          role="presentation"
          onClick={(e) => {
            const el = e.target as HTMLElement;
            if (el.closest("[data-proposal-columns-content]")) return;
            if (el.closest("[data-proposal-section-child-content]")) return;
            e.stopPropagation();
            onSelect();
          }}
          className={cn(
            "relative min-w-0 [-webkit-tap-highlight-color:transparent]",
            !sectionChild && "px-0",
            !sectionChild && (flushEdges ? "py-0" : "py-1.5"),
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

function blockLabel(type: ProposalBlock["type"]): string {
  return getBlockDefinition(type)?.label ?? "Block";
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

/** True when `applyStyleToStacks`-style mapping replaced at least one cell reference. */
function columnStacksHaveCellUpdates(
  prevStacks: ProposalColumnChildBlock[][],
  nextStacks: ProposalColumnChildBlock[][],
): boolean {
  if (prevStacks.length !== nextStacks.length) return true;
  for (let i = 0; i < nextStacks.length; i++) {
    const row = nextStacks[i];
    const prevRow = prevStacks[i];
    if (row.length !== prevRow.length) return true;
    for (let j = 0; j < row.length; j++) {
      if (row[j] !== prevRow[j]) return true;
    }
  }
  return false;
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
                        "pointer-events-none absolute right-full top-1/2 z-20 -mr-1 flex -translate-y-1/2 flex-col items-center gap-2 sm:-mr-1.5",
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
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted/50 text-muted-foreground shadow-sm transition-colors hover:border-sky-500/50 hover:bg-background hover:text-foreground data-[state=open]:border-primary data-[state=open]:bg-primary data-[state=open]:text-primary-foreground"
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const children = block.children;
  const sortableChildIds = React.useMemo(() => children.map((c) => c.id), [children]);
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

  function onChildDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = children.findIndex((c) => c.id === active.id);
    const newIndex = children.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setChildren(arrayMove(children, oldIndex, newIndex));
  }

  const resolvedBg = resolveSectionBackground(block.background);
  const backdropOn = resolvedBg.active;

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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onChildDragEnd}>
        <SortableContext items={sortableChildIds} strategy={verticalListSortingStrategy}>
          <SectionChildFloatingGutterProvider
            className={cn(
              "group/section-stack flex flex-col",
              SECTION_CHILD_GUTTER_INSET_CLASSES,
              PROPOSAL_EDITOR_SECTION_STACK_GAP_CLASSES,
              children.length > 0 && PROPOSAL_EDITOR_SECTION_STACK_BOTTOM_PAD_CLASSES,
            )}
          >
          {children.map((child, idx) => {
            const isSelected = selectedBlockId === child.id;
            const supportsStyle = child.type === "packages" || child.type === "pricing";
            return (
              <div key={child.id} className="relative isolate min-w-0">
                {idx === 0 ? (
                  <SectionChildInsertSlot
                    menu={(trigger) => (
                      <SectionInsertMenu align="start" onAdd={(b) => addChildAt(b, 0)} trigger={trigger} />
                    )}
                  />
                ) : null}
                <div className={proposalEditorSectionChildEdgePadClasses(idx, children.length)}>
                <SortableShell
                  id={child.id}
                  selected={isSelected}
                  flush
                  layout="section-child"
                  sectionChildInsertMenu={(trigger) => (
                    <SectionInsertMenu
                      align="start"
                      onAdd={(b) => addChildAt(b, idx + 1)}
                      trigger={trigger}
                    />
                  )}
                  suppressToolbar={child.type === "columns" && columnsChrome.isInnerCellActive(child.id)}
                  onSelect={() => {
                    setColumnsLayoutEditingId((prev) =>
                      prev !== null && prev !== child.id ? null : prev,
                    );
                    if (child.type === "columns") columnsChrome.clearBlockShellSelection(child.id);
                    onSelectBlock(child.id);
                  }}
                  onSelectFromNotch={
                    child.type === "columns"
                      ? () => {
                          setColumnsLayoutEditingId((prev) =>
                            prev !== null && prev !== child.id ? null : prev,
                          );
                          onSelectBlock(child.id);
                        }
                      : undefined
                  }
                  toolbar={({ dragAttributes, dragListeners }) => {
                    const dragHandle = (
                      <Tooltip delayDuration={320}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="touch-none inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                            aria-label={`Reorder ${blockLabel(child.type)}`}
                            {...dragAttributes}
                            {...dragListeners}
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          Drag to move · arrows nudge precisely
                        </TooltipContent>
                      </Tooltip>
                    );
                    const compactColumnsChrome = child.type === "columns";
                    if (child.type === "image") {
                      const ib = child as ImageBlock;
                      return (
                        <ProposalImageBlockToolbar
                          variant="shell"
                          block={ib}
                          onChange={(next) => updateChild(child.id, next as ProposalContentBlock)}
                          onDelete={() => removeChild(child.id)}
                        />
                      );
                    }
                    return (
                      <ProposalBlockToolbar
                        appearance="elevated"
                        blockType={
                          child.type === "pricing"
                            ? "pricing"
                            : child.type === "packages"
                              ? "packages"
                              : child.type === "agreement"
                                ? "agreement"
                                : "other"
                        }
                        canMoveUp={idx > 0}
                        canMoveDown={idx < children.length - 1}
                        onMoveUp={() => moveChild(child.id, -1)}
                        onMoveDown={() => moveChild(child.id, 1)}
                        onDuplicate={() => duplicateChild(child.id)}
                        deleteLabel="Remove block"
                        onDelete={() => removeChild(child.id)}
                        compactChrome={compactColumnsChrome}
                        compactPrimarySlot={
                          compactColumnsChrome ? (
                            columnsLayoutEditingId === child.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setColumnsLayoutEditingId(null);
                                  }}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-500/15 dark:text-teal-400 dark:hover:bg-teal-500/10"
                                >
                                  <Check className="h-4 w-4 shrink-0" aria-hidden />
                                  Done
                                </button>
                                <ColumnsBlockLayoutControls
                                  block={child as ColumnsBlock}
                                  onPatch={(patch) => {
                                    if (child.type !== "columns") return;
                                    updateChild(child.id, { ...child, ...patch } as ProposalContentBlock);
                                  }}
                                />
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setColumnsLayoutEditingId(child.id);
                                }}
                                className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                              >
                                <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                                Edit columns
                              </button>
                            )
                          ) : undefined
                        }
                        // Inner blocks now mirror the section toolbar: drag handle leads,
                        // overflow "more" menu is suppressed (Duplicate/Delete already
                        // sit inline). The packages add-ons removal action is the only
                        // overflow-only lever, so it's promoted into the visible row
                        // via `auxiliarySlot` when applicable.
                        showOverflowMenu={false}
                        auxiliarySlot={(() => {
                          const agreementMenu =
                            child.type === "agreement" ? (
                              <AgreementToolbarAgreementAux
                                block={child as AgreementBlock}
                                onChange={(next) => updateChild(child.id, next)}
                              />
                            ) : null;
                          const packagesSlot =
                            child.type === "packages" &&
                            packagesAddonsSectionActive(child as PackagesBlock) ? (
                              <Tooltip delayDuration={320}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                                    onClick={() => {
                                      const p = child as PackagesBlock;
                                      updateChild(child.id, {
                                        ...p,
                                        addonsSectionEnabled: false,
                                      } as ProposalContentBlock);
                                    }}
                                    aria-label="Remove add-ons table"
                                  >
                                    Remove add-ons
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                  Remove the add-ons sub-table from this Packages block
                                </TooltipContent>
                              </Tooltip>
                            ) : null;
                          if (!agreementMenu && !packagesSlot) return undefined;
                          return (
                            <span className="inline-flex flex-wrap items-center gap-1">
                              {agreementMenu}
                              {packagesSlot}
                            </span>
                          );
                        })()}
                        style={supportsStyle ? getBlockStyle(child) : undefined}
                        onStyleChange={
                          supportsStyle ? (next) => applyBlockStyle(child.id, next) : undefined
                        }
                        backdropPickerSlot={
                          child.type === "splash" ? (
                            <ProposalSplashBackgroundPickerWithBranding
                              block={child as SplashBlock}
                              onChange={(next) =>
                                updateChild(child.id, next as ProposalContentBlock)
                              }
                            />
                          ) : child.type === "packages" ? (
                            <ProposalSectionBackgroundPicker
                              background={(child as PackagesBlock).background}
                              onChange={(next) => {
                                const p = child as PackagesBlock;
                                if (!next) {
                                  const { background: _b, ...rest } = p;
                                  void _b;
                                  updateChild(child.id, rest as ProposalContentBlock);
                                } else {
                                  updateChild(child.id, { ...p, background: next } as ProposalContentBlock);
                                }
                              }}
                            />
                          ) : undefined
                        }
                        leadingSlot={undefined}
                      />
                    );
                  }}
                >
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
                </SortableShell>
                </div>
              </div>
            );
          })}
          </SectionChildFloatingGutterProvider>
        </SortableContext>
      </DndContext>
    );

  return (
    <ProposalSectionShell background={block.background} variant="editor">
      {backdropOn ? (
        <div className={PROPOSAL_EDITOR_BLOCK_CANVAS_INNER_CLASSES}>{sectionStack}</div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/65 bg-muted/15 px-1 py-1 sm:bg-muted/[0.35]">
          {sectionStack}
        </div>
      )}
    </ProposalSectionShell>
  );
}
function applyContractTemplatePickToAgreementBlock(block: AgreementBlock, pick: ContractTemplatePick): AgreementBlock {
  const snapshot = {
    agreementTitle: pick.agreementTitle.trim() || "Services Agreement",
    introHtml: pick.introHtml.trim() || undefined,
    legalHtml: pick.legalHtml ?? "",
  };
  return {
    ...block,
    contractTemplateId: pick.id,
    contractTemplateLabel: pick.name.trim() || undefined,
    agreementTitle: snapshot.agreementTitle,
    introHtml: snapshot.introHtml,
    legalHtml: snapshot.legalHtml.trim() ? snapshot.legalHtml : undefined,
  };
}
function AgreementBubbleEditMenu({
  block,
  onApplyPick,
}: {
  block: AgreementBlock;
  onApplyPick: (next: AgreementBlock) => void;
}) {
  const contractTemplateLibrary = useProposalContractTemplateLibraryOptional();
  if (!contractTemplateLibrary) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
            "bg-transparent text-muted-foreground shadow-none",
            "hover:bg-background hover:text-foreground",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Edit agreement
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="min-w-[11rem]"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={(e) => {
            e.stopPropagation();
            contractTemplateLibrary.openSelection({
              onSelect: (pick) => onApplyPick(applyContractTemplatePickToAgreementBlock(block, pick)),
            });
          }}
        >
          <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
          Change agreement
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AgreementEsignatureSettingsPopover({
  block,
  onChange,
}: {
  block: AgreementBlock;
  onChange: (next: AgreementBlock) => void;
}) {
  const esignOn = block.eSignaturesEnabled !== false;
  const paymentDetailsOn = block.paymentDetailsSectionEnabled !== false;
  const subscriptionStartMode = block.subscriptionStartDateMode ?? "on_acceptance";
  const subscriptionStartCustom =
    block.subscriptionStartCustomDate?.trim() || defaultAgreementSubscriptionStartCustomDate();
  const electronicOn = block.electronicSignatureDisclaimerEnabled !== false;
  const termsDisclaimerOn = block.termsReadDisclaimerEnabled !== false;
  const requireTermsAck = block.requireAcceptTerms !== false;
  const bid = block.id;

  return (
    <Popover>
      <Tooltip delayDuration={320}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                "bg-transparent text-muted-foreground shadow-none",
                "ring-1 ring-border/70 hover:bg-background hover:text-foreground",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
              aria-label="E-signature and acceptance settings"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <FileSignature className="h-4 w-4 shrink-0" aria-hidden />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[14rem] text-xs">
          E-signature & acceptance
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        className="w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden p-0"
        align="start"
        side="bottom"
        sideOffset={8}
        collisionPadding={32}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[min(32rem,80vh)] overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">
                E-signatures
              </p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                When enabled, signers can add a drawn or typed signature. When off, they accept with name and email
                only.
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <Label htmlFor={`agreement-esign-${bid}`} className="cursor-pointer text-sm font-medium">
                  Enable e-sign
                </Label>
                <Switch
                  id={`agreement-esign-${bid}`}
                  checked={esignOn}
                  onCheckedChange={(checked) => onChange({ ...block, eSignaturesEnabled: checked })}
                />
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">Payment</p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                Show or hide the Add payment details step before signing. Turn off to hide that step (acceptance is
                still recorded; the in-modal subscription setup is skipped).
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <Label
                  htmlFor={`agreement-payment-details-${bid}`}
                  className="cursor-pointer text-sm font-medium"
                >
                  Add payment details
                </Label>
                <Switch
                  id={`agreement-payment-details-${bid}`}
                  checked={paymentDetailsOn}
                  onCheckedChange={(checked) => onChange({ ...block, paymentDetailsSectionEnabled: checked })}
                />
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">
                Subscription start date
              </p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                When a subscription is created after acceptance (payment details in modal or staff follow-up),
                this sets the Stripe schedule start date — same options as Add subscription on the Subscriptions
                page.
              </p>
              <div className="mt-3 space-y-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`agreement-sub-start-mode-${bid}`} className="text-sm font-medium">
                    Start date
                  </Label>
                  <select
                    id={`agreement-sub-start-mode-${bid}`}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={subscriptionStartMode}
                    onChange={(e) => {
                      const mode = e.target.value as AgreementSubscriptionStartDateMode;
                      onChange({
                        ...block,
                        subscriptionStartDateMode: mode,
                        ...(mode === "custom" && !block.subscriptionStartCustomDate
                          ? { subscriptionStartCustomDate: defaultAgreementSubscriptionStartCustomDate() }
                          : {}),
                      });
                    }}
                  >
                    {AGREEMENT_SUBSCRIPTION_START_DATE_MODE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {subscriptionStartMode === "custom" ? (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`agreement-sub-start-custom-${bid}`} className="text-sm font-medium">
                      Custom date
                    </Label>
                    <Input
                      id={`agreement-sub-start-custom-${bid}`}
                      type="date"
                      className="h-9"
                      value={subscriptionStartCustom}
                      onChange={(e) =>
                        onChange({
                          ...block,
                          subscriptionStartCustomDate: e.target.value,
                          subscriptionStartDateMode: "custom",
                        })
                      }
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">
                Prefilled fields
              </p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                When enabled and the proposal is linked to a CRM customer, the buyer&apos;s name, email, and
                organisation from that customer record are pre-filled in the accept flow.
              </p>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={`agreement-prefill-name-${bid}`} className="cursor-pointer text-sm font-medium">
                    Name
                  </Label>
                  <Switch
                    id={`agreement-prefill-name-${bid}`}
                    checked={Boolean(block.prefillSignerNameEnabled)}
                    onCheckedChange={(checked) => onChange({ ...block, prefillSignerNameEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={`agreement-prefill-email-${bid}`} className="cursor-pointer text-sm font-medium">
                    Email
                  </Label>
                  <Switch
                    id={`agreement-prefill-email-${bid}`}
                    checked={Boolean(block.prefillSignerEmailEnabled)}
                    onCheckedChange={(checked) => onChange({ ...block, prefillSignerEmailEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label
                    htmlFor={`agreement-prefill-org-${bid}`}
                    className="cursor-pointer text-sm font-medium"
                  >
                    Organisation
                  </Label>
                  <Switch
                    id={`agreement-prefill-org-${bid}`}
                    checked={Boolean(block.prefillSignerOrganizationEnabled)}
                    onCheckedChange={(checked) =>
                      onChange({ ...block, prefillSignerOrganizationEnabled: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">Disclaimer</p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                Optional acknowledgements shown in the accept flow before signing.
              </p>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label
                    htmlFor={`agreement-disclaimer-esign-${bid}`}
                    className="cursor-pointer text-sm font-medium leading-snug"
                  >
                    E-Signature legal acknowledgment
                  </Label>
                  <Switch
                    id={`agreement-disclaimer-esign-${bid}`}
                    checked={electronicOn}
                    onCheckedChange={(checked) =>
                      onChange({ ...block, electronicSignatureDisclaimerEnabled: checked })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label
                      htmlFor={`agreement-disclaimer-terms-${bid}`}
                      className="cursor-pointer text-sm font-medium leading-snug"
                    >
                      Agreement to terms acknowledgement
                    </Label>
                    <Switch
                      id={`agreement-disclaimer-terms-${bid}`}
                      checked={termsDisclaimerOn}
                      onCheckedChange={(checked) =>
                        onChange({ ...block, termsReadDisclaimerEnabled: checked })
                      }
                    />
                  </div>
                  {termsDisclaimerOn ? (
                    <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
                      <Label
                        htmlFor={`agreement-require-terms-${bid}`}
                        className="cursor-pointer text-sm font-medium text-muted-foreground"
                      >
                        Require acknowledgement
                      </Label>
                      <Switch
                        id={`agreement-require-terms-${bid}`}
                        checked={requireTermsAck}
                        onCheckedChange={(checked) => onChange({ ...block, requireAcceptTerms: checked })}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AgreementToolbarAgreementAux({
  block,
  onChange,
}: {
  block: AgreementBlock;
  onChange: (next: AgreementBlock) => void;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <AgreementBubbleEditMenu block={block} onApplyPick={onChange} />
      <AgreementEsignatureSettingsPopover block={block} onChange={onChange} />
    </span>
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
        <div className="relative inline-flex max-w-full">
          <div
            className="inline-flex h-10 min-w-0 max-w-full items-center justify-center rounded-lg px-5 text-sm font-semibold shadow-sm"
            style={{ backgroundColor: ctaColor, color: fg }}
          >
            <span className="truncate">{label}</span>
          </div>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute -right-1.5 -top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const children = block.children;
  const sortableChildIds = React.useMemo(() => children.map((c) => c.id), [children]);
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

  function onChildDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = children.findIndex((c) => c.id === active.id);
    const newIndex = children.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setChildren(arrayMove(children, oldIndex, newIndex));
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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onChildDragEnd}>
        <SortableContext items={sortableChildIds} strategy={verticalListSortingStrategy}>
          <SectionChildFloatingGutterProvider
            className={cn(
              "group/section-stack flex flex-col",
              SECTION_CHILD_GUTTER_INSET_CLASSES,
              PROPOSAL_EDITOR_SECTION_STACK_GAP_CLASSES,
              children.length > 0 && PROPOSAL_EDITOR_SECTION_STACK_BOTTOM_PAD_CLASSES,
            )}
          >
          {children.map((child, idx) => {
            const isSelected = selectedBlockId === child.id;
            const supportsStyle = child.type === "packages" || child.type === "pricing";
            return (
              <div key={child.id} className="relative isolate min-w-0">
                {idx === 0 ? (
                  <SectionChildInsertSlot
                    menu={(trigger) => (
                      <SectionInsertMenu align="start" onAdd={(b) => addChildAt(b, 0)} trigger={trigger} />
                    )}
                  />
                ) : null}
                <div className={proposalEditorSectionChildEdgePadClasses(idx, children.length)}>
                <SortableShell
                  id={child.id}
                  selected={isSelected}
                  flush
                  layout="section-child"
                  sectionChildInsertMenu={(trigger) => (
                    <SectionInsertMenu
                      align="start"
                      onAdd={(b) => addChildAt(b, idx + 1)}
                      trigger={trigger}
                    />
                  )}
                  suppressToolbar={child.type === "columns" && columnsChrome.isInnerCellActive(child.id)}
                  onSelect={() => {
                    setColumnsLayoutEditingId((prev) =>
                      prev !== null && prev !== child.id ? null : prev,
                    );
                    if (child.type === "columns") columnsChrome.clearBlockShellSelection(child.id);
                    onSelectBlock(child.id);
                  }}
                  onSelectFromNotch={
                    child.type === "columns"
                      ? () => {
                          setColumnsLayoutEditingId((prev) =>
                            prev !== null && prev !== child.id ? null : prev,
                          );
                          onSelectBlock(child.id);
                        }
                      : undefined
                  }
                  toolbar={({ dragAttributes, dragListeners }) => {
                    const dragHandle = (
                      <Tooltip delayDuration={320}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="touch-none inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                            aria-label={`Reorder ${blockLabel(child.type)}`}
                            {...dragAttributes}
                            {...dragListeners}
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          Drag to move · arrows nudge precisely
                        </TooltipContent>
                      </Tooltip>
                    );
                    const compactColumnsChrome = child.type === "columns";
                    if (child.type === "image") {
                      const ib = child as ImageBlock;
                      return (
                        <ProposalImageBlockToolbar
                          variant="shell"
                          block={ib}
                          onChange={(next) => updateChild(child.id, next as ProposalAgreementChildBlock)}
                          onDelete={() => removeChild(child.id)}
                        />
                      );
                    }
                    return (
                      <ProposalBlockToolbar
                        appearance="elevated"
                        blockType={
                          child.type === "pricing"
                            ? "pricing"
                            : child.type === "packages"
                              ? "packages"
                              : "other"
                        }
                        canMoveUp={idx > 0}
                        canMoveDown={idx < children.length - 1}
                        onMoveUp={() => moveChild(child.id, -1)}
                        onMoveDown={() => moveChild(child.id, 1)}
                        onDuplicate={() => duplicateChild(child.id)}
                        deleteLabel="Remove block"
                        onDelete={() => removeChild(child.id)}
                        compactChrome={compactColumnsChrome}
                        compactPrimarySlot={
                          compactColumnsChrome ? (
                            columnsLayoutEditingId === child.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setColumnsLayoutEditingId(null);
                                  }}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-500/15 dark:text-teal-400 dark:hover:bg-teal-500/10"
                                >
                                  <Check className="h-4 w-4 shrink-0" aria-hidden />
                                  Done
                                </button>
                                <ColumnsBlockLayoutControls
                                  block={child as ColumnsBlock}
                                  onPatch={(patch) => {
                                    if (child.type !== "columns") return;
                                    updateChild(child.id, { ...child, ...patch } as ProposalAgreementChildBlock);
                                  }}
                                />
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setColumnsLayoutEditingId(child.id);
                                }}
                                className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                              >
                                <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                                Edit columns
                              </button>
                            )
                          ) : undefined
                        }
                        showOverflowMenu={false}
                        auxiliarySlot={(() => {
                          const packagesSlot =
                            child.type === "packages" &&
                            packagesAddonsSectionActive(child as PackagesBlock) ? (
                              <Tooltip delayDuration={320}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                                    onClick={() => {
                                      const p = child as PackagesBlock;
                                      updateChild(child.id, {
                                        ...p,
                                        addonsSectionEnabled: false,
                                      } as ProposalAgreementChildBlock);
                                    }}
                                    aria-label="Remove add-ons table"
                                  >
                                    Remove add-ons
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                  Remove the add-ons sub-table from this Packages block
                                </TooltipContent>
                              </Tooltip>
                            ) : null;
                          return packagesSlot ?? undefined;
                        })()}
                        style={supportsStyle ? getBlockStyle(child) : undefined}
                        onStyleChange={
                          supportsStyle ? (next) => applyBlockStyle(child.id, next) : undefined
                        }
                        backdropPickerSlot={
                          child.type === "splash" ? (
                            <ProposalSplashBackgroundPickerWithBranding
                              block={child as SplashBlock}
                              onChange={(next) =>
                                updateChild(child.id, next as ProposalAgreementChildBlock)
                              }
                            />
                          ) : child.type === "packages" ? (
                            <ProposalSectionBackgroundPicker
                              background={(child as PackagesBlock).background}
                              onChange={(next) => {
                                const p = child as PackagesBlock;
                                if (!next) {
                                  const { background: _b, ...rest } = p;
                                  void _b;
                                  updateChild(child.id, rest as ProposalAgreementChildBlock);
                                } else {
                                  updateChild(child.id, { ...p, background: next } as ProposalAgreementChildBlock);
                                }
                              }}
                            />
                          ) : undefined
                        }
                        leadingSlot={undefined}
                      />
                    );
                  }}
                >
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
                </SortableShell>
                </div>
              </div>
            );
          })}
          </SectionChildFloatingGutterProvider>
        </SortableContext>
      </DndContext>
    );

  const settingsFooter = (
    <div className="w-full px-2 pb-4 pt-4 sm:px-3">
      <AgreementBlockEditor block={block} onChange={(next) => onChange(next)} />
    </div>
  );

  return (
    <ProposalSectionShell background={block.background} variant="editor">
      {backdropOn ? (
        <div className={PROPOSAL_EDITOR_BLOCK_CANVAS_INNER_CLASSES}>
          <div className="flex min-w-0 flex-col">
            {acceptStack}
            {settingsFooter}
          </div>
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
export { useColumnsInnerCellChrome, columnStacksHaveCellUpdates, AgreementToolbarAgreementAux, cloneBlockWithFreshIds, SortableShell, blockLabel };

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
