"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { type Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Braces,
  ChevronDown,
  ChevronUp,
  Italic,
  Link as LinkIcon,
  List,
  ImageIcon,
  ListOrdered,
  MoreHorizontal,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
} from "lucide-react";
import {
  proposalToolbarBubbleActiveAccentClasses,
  proposalToolbarBubbleBadgeClasses,
  proposalToolbarBubbleFieldShellClasses,
  proposalToolbarBubbleInlineInputClasses,
  proposalToolbarBubbleMenuItemClasses,
  proposalToolbarBubbleMutedFgClasses,
  proposalToolbarBubblePanelClasses,
  proposalToolbarBubblePanelFloatingClasses,
  proposalToolbarBubbleSelectClasses,
  proposalToolbarBubbleSmallIconButtonClasses,
  proposalToolbarBubbleStepperButtonClasses,
  proposalToolbarBubbleTriggerClasses,
  proposalToolbarHintClasses,
  proposalToolbarMenuItemClasses,
  proposalToolbarMenuItemHoverClasses,
  proposalToolbarShellClasses,
} from "@/lib/proposal/editor-toolbar-tokens";
import { cn } from "@/lib/utils";
import { proposalRichTextDisplayClasses } from "@/lib/proposal/rich-text/display-typography";
import { PROPOSAL_MERGE_TOKEN_CHOICES } from "@/lib/proposal/rich-text/merge-token-choices";
import {
  PROPOSAL_FONT_MENU_SECTIONS,
  PROPOSAL_FONT_WEIGHT_OPTIONS,
  normalizeProposalFontFamily,
  proposalFontPreviewFamily,
  resolveProposalFontOption,
} from "@/lib/proposal/rich-text/fonts";
import { createProposalRichTextExtensions } from "@/lib/proposal/rich-text/tiptap-extensions";
import {
  parseRichTextFontSizePx,
  type ProposalLetterCase,
} from "@/lib/proposal/rich-text/tiptap-typography";
import { useProposalSectionEditorAppearance, useProposalSectionEditorChrome } from "@/components/features/proposal/editor/section-chrome/proposal-section-editor-chrome";
import { useProposalSingleLayoutRichTextEditorOptional } from "@/components/features/proposal/editor/single-layout-rich-text-context";
import {
  ProposalToolbarIconButton,
  ProposalToolbarSectionLabel,
  ProposalToolbarSeparator,
} from "@/components/features/proposal/editor/toolbar";

interface HeadingOption {
  value: "p" | "h1" | "h2" | "h3" | "h4" | "blockquote";
  label: string;
  shortLabel: string;
}

const HEADING_OPTIONS: HeadingOption[] = [
  { value: "h1", shortLabel: "H1", label: "Title" },
  { value: "h2", shortLabel: "H2", label: "Subtitle" },
  { value: "h3", shortLabel: "H3", label: "Heading" },
  { value: "h4", shortLabel: "H4", label: "Subheading" },
  { value: "p", shortLabel: "T1", label: "Body text" },
  { value: "blockquote", shortLabel: "T2", label: "Pull quote" },
];

function getActiveHeading(editor: Editor): HeadingOption {
  if (editor.isActive("blockquote")) return HEADING_OPTIONS[5];
  for (let i = 0; i < 4; i += 1) {
    const opt = HEADING_OPTIONS[i];
    const level = Number(opt.value.slice(1));
    if (editor.isActive("heading", { level })) return opt;
  }
  return HEADING_OPTIONS[4];
}

function applyHeadingOption(editor: Editor, opt: HeadingOption) {
  const c = editor.chain().focus();
  if (opt.value === "p") {
    c.setParagraph().run();
    return;
  }
  if (opt.value === "blockquote") {
    if (editor.isActive("blockquote")) {
      c.toggleBlockquote().run();
    } else {
      c.setParagraph().toggleBlockquote().run();
    }
    return;
  }
  c.toggleHeading({ level: Number(opt.value.slice(1)) as 1 | 2 | 3 | 4 }).run();
}

const ALIGN_OPTIONS: { value: "left" | "center" | "right"; icon: typeof AlignLeft; label: string }[] = [
  { value: "left", icon: AlignLeft, label: "Left" },
  { value: "center", icon: AlignCenter, label: "Center" },
  { value: "right", icon: AlignRight, label: "Right" },
];

const VIEWPORT_EDGE_PAD_PX = 8;

/** Stable Floating UI config — TipTap v3 BubbleMenu re-dispatches plugin updates when `options` identity changes. */
const BUBBLE_MENU_FLOATING_OPTIONS = {
  placement: "top" as const,
  offset: 6,
  flip: { fallbackPlacements: ["bottom", "top"] as Array<"bottom" | "top"> },
  shift: { padding: VIEWPORT_EDGE_PAD_PX },
};

/** Radix dropdowns portal to `document.body`; inside the Floating UI bubble that breaks anchor geometry. Inline panels stay under the trigger. */
function useCloseBubbleToolbarMenu(
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  containerRef: React.RefObject<HTMLElement | null>,
  extraContainRefs?: React.RefObject<HTMLElement | null>[],
) {
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (el.contains(t)) return;
      for (const extra of extraContainRefs ?? []) {
        if (extra.current?.contains(t)) return;
      }
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, setOpen, containerRef, extraContainRefs]);
}

function useFixedToolbarMenuPosition(
  open: boolean,
  triggerRef: React.RefObject<HTMLElement | null>,
  panelRef: React.RefObject<HTMLElement | null>,
  {
    estimatedWidthPx,
    align = "start",
    placement = "below",
  }: {
    estimatedWidthPx?: number;
    align?: "start" | "end";
    placement?: "below" | "above";
  } = {},
) {
  const [panelStyle, setPanelStyle] = React.useState<React.CSSProperties | null>(null);

  React.useLayoutEffect(() => {
    if (!open) {
      setPanelStyle(null);
      return;
    }
    const trigger = triggerRef.current;
    if (!trigger) return;

    const updatePosition = () => {
      const tr = trigger.getBoundingClientRect();
      const pr = panelRef.current?.getBoundingClientRect();
      const width = Math.ceil(pr?.width ?? estimatedWidthPx ?? 216);
      const height = Math.ceil(pr?.height ?? 0);

      let left = align === "end" ? tr.right - width : tr.left;
      left = Math.min(
        Math.max(VIEWPORT_EDGE_PAD_PX, left),
        window.innerWidth - width - VIEWPORT_EDGE_PAD_PX,
      );

      const gapPx = 4;
      const spaceBelow = window.innerHeight - VIEWPORT_EDGE_PAD_PX - (tr.bottom + gapPx);
      const spaceAbove = tr.top - gapPx - VIEWPORT_EDGE_PAD_PX;
      const openAbove =
        placement === "above" ||
        (placement === "below" && height > 0 && height > spaceBelow && height <= spaceAbove);

      const style: React.CSSProperties = {
        position: "fixed",
        left,
        top: openAbove ? tr.top - gapPx : tr.bottom + gapPx,
        zIndex: 10000,
      };
      if (estimatedWidthPx != null) style.width = estimatedWidthPx;
      if (openAbove) style.transform = "translateY(-100%)";

      setPanelStyle(style);
    };

    updatePosition();
    const raf = requestAnimationFrame(updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, align, estimatedWidthPx, placement, triggerRef, panelRef]);

  return panelStyle;
}

function RichTextToolbarButton({
  active,
  onClick,
  ariaLabel,
  children,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const appearance = useProposalSectionEditorAppearance();
  return (
    <ProposalToolbarIconButton
      appearance={appearance}
      active={active}
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </ProposalToolbarIconButton>
  );
}

function RichTextToolbarDivider() {
  const appearance = useProposalSectionEditorAppearance();
  return <ProposalToolbarSeparator appearance={appearance} />;
}

function HeadingPicker({ editor }: { editor: Editor }) {
  const appearance = useProposalSectionEditorAppearance();
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const panelStyle = useFixedToolbarMenuPosition(open, triggerRef, panelRef, { align: "start" });
  const active = getActiveHeading(editor);
  useCloseBubbleToolbarMenu(open, setOpen, triggerRef, [panelRef]);

  const panel =
    open && panelStyle ? (
      <div
        ref={panelRef}
        role="menu"
        style={panelStyle}
        className={cn(proposalToolbarBubblePanelClasses(appearance), "min-w-[200px]")}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {HEADING_OPTIONS.map((opt) => {
          const isActive = active.value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="menuitem"
              className={proposalToolbarBubbleMenuItemClasses(appearance, isActive)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => {
                applyHeadingOption(editor, opt);
                setOpen(false);
              }}
            >
              <span
                className={cn(
                  "inline-block w-7 text-center text-xs font-semibold",
                  isActive
                    ? proposalToolbarBubbleActiveAccentClasses(appearance)
                    : proposalToolbarBubbleMutedFgClasses(appearance),
                )}
              >
                {opt.shortLabel}
              </span>
              <span className="whitespace-nowrap">{opt.label}</span>
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <div className="relative" ref={triggerRef}>
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        aria-label="Text style"
        aria-expanded={open}
        aria-haspopup="menu"
        className={proposalToolbarBubbleTriggerClasses(appearance)}
      >
        <span className={proposalToolbarBubbleBadgeClasses(appearance)}>
          {active.shortLabel}
        </span>
        <span className="whitespace-nowrap">{active.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5", proposalToolbarBubbleMutedFgClasses(appearance))} />
      </button>
      {typeof document !== "undefined" && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}

function FontFamilyPicker({
  editor,
  layout = "toolbar",
}: {
  editor: Editor;
  layout?: "toolbar" | "menu";
}) {
  const appearance = useProposalSectionEditorAppearance();
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const menuLayout = layout === "menu";
  // Toolbar variant portals to the top layer so it clears sibling blocks; the menu variant
  // already lives inside a portaled panel, so it stays inline to keep that menu's outside-click intact.
  const panelStyle = useFixedToolbarMenuPosition(open && !menuLayout, triggerRef, panelRef, {
    align: "start",
  });
  useCloseBubbleToolbarMenu(open, setOpen, triggerRef, [panelRef]);

  const { fontFamilyRaw } = useEditorState({
    editor,
    selector: (snap) => ({
      fontFamilyRaw: snap.editor.getAttributes("textStyle").fontFamily as string | undefined,
    }),
  });

  const active = resolveProposalFontOption(fontFamilyRaw);

  const menuBody = PROPOSAL_FONT_MENU_SECTIONS.map((section) => (
    <div key={section.id} role="group" aria-label={section.label}>
      {section.label ? (
        <ProposalToolbarSectionLabel appearance={appearance} className="px-2 pb-1 pt-2 first:pt-1">
          {section.label}
        </ProposalToolbarSectionLabel>
      ) : null}
      {section.items.map((opt) => {
        const isActive =
          opt.value === ""
            ? !fontFamilyRaw || normalizeProposalFontFamily(fontFamilyRaw) === ""
            : normalizeProposalFontFamily(opt.value) === normalizeProposalFontFamily(fontFamilyRaw);
        const preview = proposalFontPreviewFamily(opt.value);
        return (
          <button
            key={`${section.id}-${opt.label}-${opt.value}`}
            type="button"
            role="menuitem"
            className={cn(proposalToolbarBubbleMenuItemClasses(appearance, isActive), "justify-between")}
            style={preview ? { fontFamily: preview } : undefined}
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => {
              if (!opt.value) {
                editor.chain().focus().unsetFontFamily().run();
              } else {
                editor.chain().focus().setFontFamily(opt.value).run();
              }
              setOpen(false);
            }}
          >
            <span className="whitespace-nowrap">{opt.label}</span>
            {isActive ? (
              <span className={proposalToolbarBubbleActiveAccentClasses(appearance)} aria-hidden>
                ✓
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  ));

  const menuClasses =
    "min-w-[11rem] max-w-[min(18rem,calc(100vw-2rem))] max-h-[min(50vh,22rem)] overflow-y-auto overflow-x-hidden";

  const portaledPanel =
    open && !menuLayout && panelStyle ? (
      <div
        ref={panelRef}
        role="menu"
        style={panelStyle}
        className={cn(proposalToolbarBubblePanelClasses(appearance), menuClasses)}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {menuBody}
      </div>
    ) : null;

  return (
    <div className={cn("relative", menuLayout && "w-full")} ref={triggerRef}>
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        aria-label="Font"
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          proposalToolbarBubbleTriggerClasses(appearance),
          menuLayout
            ? cn("h-8 w-full justify-between px-2", proposalToolbarBubbleFieldShellClasses(appearance))
            : "max-w-[9.5rem] px-2 py-1",
        )}
      >
        <span
          className="min-w-0 truncate whitespace-nowrap"
          style={
            active.value
              ? { fontFamily: proposalFontPreviewFamily(active.value) ?? active.value }
              : undefined
          }
        >
          {active.label}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0", proposalToolbarBubbleMutedFgClasses(appearance))} />
      </button>
      {menuLayout && open ? (
        <div
          ref={panelRef}
          role="menu"
          className={cn(proposalToolbarBubblePanelFloatingClasses(appearance), menuClasses)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {menuBody}
        </div>
      ) : null}
      {typeof document !== "undefined" && portaledPanel
        ? createPortal(portaledPanel, document.body)
        : null}
    </div>
  );
}

/**
 * Effective (rendered) font size in px at the selection, read from the DOM. Reflects the size the
 * user actually sees — including heading-level and inherited CSS sizes that carry no inline
 * `fontSize` mark — so the control isn't stuck on a hard-coded default. Returns null off the DOM.
 */
function readSelectionFontSizePx(editor: Editor): number | null {
  if (typeof window === "undefined") return null;
  try {
    const { state, view } = editor;
    const { empty, from } = state.selection;
    const pos = empty ? state.selection.$head.pos : from;
    const { node } = view.domAtPos(Math.max(1, pos));
    const el = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
    if (!el) return null;
    const px = Number.parseFloat(window.getComputedStyle(el).fontSize);
    return Number.isFinite(px) ? Math.round(px) : null;
  } catch {
    return null;
  }
}

function FontSizeControl({ editor }: { editor: Editor }) {
  const appearance = useProposalSectionEditorAppearance();
  const { fontSizeRaw, effectivePx } = useEditorState({
    editor,
    selector: (snap) => ({
      fontSizeRaw: snap.editor.getAttributes("textStyle").fontSize as string | undefined,
      effectivePx: readSelectionFontSizePx(snap.editor),
    }),
  });
  const value = effectivePx ?? parseRichTextFontSizePx(fontSizeRaw) ?? 16;
  function clamp(n: number) {
    return Math.max(8, Math.min(120, Math.round(n)));
  }
  function set(next: number) {
    editor.chain().focus().setFontSize(`${clamp(next)}px`).run();
  }
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded",
        appearance === "elevated" ? "text-[var(--proposal-toolbar-fg)]" : "text-foreground",
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <input
        type="number"
        min={8}
        max={120}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n) && n > 0) set(n);
        }}
        className={cn(
          "w-10 rounded bg-transparent px-1 py-0.5 text-center text-sm tabular-nums outline-none",
          appearance === "elevated" ? "focus:bg-[var(--proposal-toolbar-hover-bg)]" : "focus:bg-muted",
          "[appearance:textfield] [-moz-appearance:textfield]",
          "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        )}
        aria-label="Font size"
      />
      <span className="flex shrink-0 flex-col">
        <button
          type="button"
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => set(value + 1)}
          aria-label="Increase font size"
          className={proposalToolbarBubbleStepperButtonClasses(appearance)}
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => set(value - 1)}
          aria-label="Decrease font size"
          className={proposalToolbarBubbleStepperButtonClasses(appearance)}
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </span>
    </div>
  );
}

function ColorControl({ editor }: { editor: Editor }) {
  const appearance = useProposalSectionEditorAppearance();
  const { colorRaw } = useEditorState({
    editor,
    selector: (snap) => ({
      colorRaw: snap.editor.getAttributes("textStyle").color as string | undefined,
    }),
  });
  const current = colorRaw ?? (appearance === "elevated" ? "#ffffff" : "#000000");
  return (
    <label
      className={cn(proposalToolbarBubbleSmallIconButtonClasses(appearance), "cursor-pointer")}
      aria-label="Text color"
      onMouseDown={(e) => e.preventDefault()}
    >
      <span
        className="flex h-4 w-4 items-end justify-center text-xs font-bold leading-none"
        style={{ borderBottom: `3px solid ${current}` }}
      >
        A
      </span>
      <input
        type="color"
        value={current}
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        className="sr-only"
      />
    </label>
  );
}

function AlignmentPicker({ editor }: { editor: Editor }) {
  const appearance = useProposalSectionEditorAppearance();
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const panelStyle = useFixedToolbarMenuPosition(open, triggerRef, panelRef, { align: "start" });
  const current =
    ALIGN_OPTIONS.find((a) => editor.isActive({ textAlign: a.value })) ?? ALIGN_OPTIONS[0];
  const Icon = current.icon;
  useCloseBubbleToolbarMenu(open, setOpen, triggerRef, [panelRef]);

  const panel =
    open && panelStyle ? (
      <div
        ref={panelRef}
        role="menu"
        style={panelStyle}
        className={cn(proposalToolbarBubblePanelClasses(appearance), "min-w-[9rem]")}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {ALIGN_OPTIONS.map((a) => {
          const Ic = a.icon;
          const isActive = current.value === a.value;
          return (
            <button
              key={a.value}
              type="button"
              role="menuitem"
              className={proposalToolbarBubbleMenuItemClasses(appearance, isActive)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => {
                editor.chain().focus().setTextAlign(a.value).run();
                setOpen(false);
              }}
            >
              <Ic className="h-4 w-4 shrink-0" />
              {a.label}
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <div className="relative" ref={triggerRef}>
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        aria-label="Text alignment"
        aria-expanded={open}
        aria-haspopup="menu"
        className={proposalToolbarBubbleSmallIconButtonClasses(appearance, open)}
      >
        <Icon className="h-4 w-4" />
      </button>
      {typeof document !== "undefined" && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}

const MERGE_FIELD_PANEL_WIDTH_PX = 340;

function MergeFieldMenu({ editor }: { editor: Editor }) {
  const appearance = useProposalSectionEditorAppearance();
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const panelStyle = useFixedToolbarMenuPosition(open, triggerRef, panelRef, {
    estimatedWidthPx: MERGE_FIELD_PANEL_WIDTH_PX,
    align: "end",
    placement: "above",
  });
  useCloseBubbleToolbarMenu(open, setOpen, triggerRef, [panelRef]);

  function insert(snippet: string) {
    editor.chain().focus().insertContent(snippet).run();
    setOpen(false);
  }

  const panel =
    open && panelStyle ? (
      <div
        ref={panelRef}
        role="menu"
        style={panelStyle}
        className={cn(proposalToolbarBubblePanelClasses(appearance), "min-w-[17rem]")}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <ProposalToolbarSectionLabel appearance={appearance} className="px-2 pb-1 pt-1.5">
          CRM merge tokens
        </ProposalToolbarSectionLabel>
        <div className="max-h-[min(70vh,24rem)] overflow-y-auto overscroll-y-contain">
          {PROPOSAL_MERGE_TOKEN_CHOICES.map((opt) => (
            <button
              key={opt.insert}
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full rounded px-2 py-1.5 text-left leading-snug outline-none",
                proposalToolbarMenuItemClasses(appearance),
                proposalToolbarMenuItemHoverClasses(appearance),
              )}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => insert(opt.insert)}
            >
              <span>
                {opt.label}: <span className={proposalToolbarBubbleActiveAccentClasses(appearance)}>{opt.insert}</span>
                {opt.description ? (
                  <span className={proposalToolbarBubbleMutedFgClasses(appearance)}> — {opt.description}</span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className="relative" ref={triggerRef}>
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        aria-label="Insert merge field"
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          proposalToolbarBubbleSmallIconButtonClasses(appearance),
          appearance === "elevated" ? "border border-white/20" : "border border-border",
        )}
      >
        <Braces className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
      </button>
      {typeof document !== "undefined" && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}

function LinkButton({ editor }: { editor: Editor }) {
  const active = editor.isActive("link");
  return (
    <RichTextToolbarButton
      active={active}
      ariaLabel="Link"
      onClick={() => {
        const existing = (editor.getAttributes("link").href as string | undefined) ?? "";
        const next = window.prompt("Link URL", existing);
        if (next === null) return;
        const url = next.trim();
        if (!url) {
          editor.chain().focus().extendMarkRange("link").unsetLink().run();
          return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }}
    >
      <LinkIcon className="h-4 w-4" />
    </RichTextToolbarButton>
  );
}

function roundTypography(n: number, decimals = 2) {
  const p = 10 ** decimals;
  return Math.round(n * p) / p;
}

const TYPOGRAPHY_MORE_MENU_WIDTH_PX = 216;

function TypographyNumericField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
}) {
  const appearance = useProposalSectionEditorAppearance();
  function clamp(n: number) {
    return Math.min(max, Math.max(min, roundTypography(n)));
  }
  return (
    <div className="space-y-1">
      <span className={cn("block text-xs", proposalToolbarHintClasses(appearance))}>{label}</span>
      <div
        className={proposalToolbarBubbleFieldShellClasses(appearance)}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(clamp(n));
          }}
          className={cn(
            proposalToolbarBubbleInlineInputClasses(appearance),
            "[appearance:textfield] [-moz-appearance:textfield]",
            "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          )}
          aria-label={label}
        />
        <span className="flex shrink-0 flex-col">
          <button
            type="button"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => onChange(clamp(value + step))}
            aria-label={`Increase ${label}`}
            className={proposalToolbarBubbleStepperButtonClasses(appearance)}
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => onChange(clamp(value - step))}
            aria-label={`Decrease ${label}`}
            className={proposalToolbarBubbleStepperButtonClasses(appearance)}
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </span>
      </div>
    </div>
  );
}

function TypographyMoreMenu({ editor }: { editor: Editor }) {
  const appearance = useProposalSectionEditorAppearance();
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const panelStyle = useFixedToolbarMenuPosition(open, triggerRef, panelRef, {
    estimatedWidthPx: TYPOGRAPHY_MORE_MENU_WIDTH_PX,
    align: "end",
    placement: "below",
  });
  useCloseBubbleToolbarMenu(open, setOpen, triggerRef, [panelRef]);

  const state = useEditorState({
    editor,
    selector: (snap) => {
      const parent = snap.editor.state.selection.$from.parent;
      const blockType = parent.type.name;
      const canEditBlock = blockType === "paragraph" || blockType === "heading" || blockType === "blockquote";
      return {
        canEditBlock,
        lineHeight: parent.attrs.lineHeight as string | null | undefined,
        marginTop: parent.attrs.marginTop as string | null | undefined,
        marginBottom: parent.attrs.marginBottom as string | null | undefined,
        letterSpacing: parent.attrs.letterSpacing as string | null | undefined,
        letterCase: (parent.attrs.letterCase as ProposalLetterCase | null | undefined) ?? null,
        fontWeightRaw: snap.editor.getAttributes("textStyle").fontWeight as string | undefined,
      };
    },
  });

  const lineHeight = Number(state.lineHeight ?? 1.3);
  const marginTop = Number(state.marginTop ?? 0);
  const marginBottom = Number(state.marginBottom ?? 0);
  const letterSpacing = Number(state.letterSpacing ?? 0);
  const letterCase = state.letterCase ?? "none";
  const fontWeight = state.fontWeightRaw ?? "";

  const panel =
    open && panelStyle ? (
      <div
        ref={panelRef}
        role="menu"
        style={panelStyle}
        className={cn(proposalToolbarBubblePanelClasses(appearance), "min-w-[13.5rem] space-y-2.5 p-2")}
        onPointerDown={(e) => e.stopPropagation()}
      >
          <div className="space-y-1">
            <span className={cn("block text-xs", proposalToolbarHintClasses(appearance))}>Font</span>
            <FontFamilyPicker editor={editor} layout="menu" />
          </div>

          <div className="space-y-1">
            <label htmlFor="proposal-rich-font-weight" className={cn("block text-xs", proposalToolbarHintClasses(appearance))}>
              Font weight
            </label>
            <select
              id="proposal-rich-font-weight"
              value={fontWeight}
              onChange={(e) => {
                const v = e.target.value;
                editor.chain().focus().setFontWeight(v || null).run();
              }}
              className={proposalToolbarBubbleSelectClasses(appearance)}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {PROPOSAL_FONT_WEIGHT_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {state.canEditBlock ? (
            <>
              <TypographyNumericField
                label="Line height"
                value={lineHeight}
                min={0.8}
                max={3}
                step={0.05}
                onChange={(n) => editor.chain().focus().setBlockLineHeight(String(n)).run()}
              />
              <TypographyNumericField
                label="Letter spacing"
                value={letterSpacing}
                min={-0.2}
                max={0.5}
                step={0.01}
                onChange={(n) =>
                  editor.chain().focus().setBlockLetterSpacing(n === 0 ? "0" : String(n)).run()
                }
              />
              <div className="space-y-1">
                <span className={cn("block text-xs", proposalToolbarHintClasses(appearance))}>Letter case</span>
                <div
                  className={cn(
                    "flex h-8 overflow-hidden rounded border",
                    appearance === "elevated" ? "border-white/10" : "border-border",
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={letterCase !== "uppercase"}
                    className={cn(
                      "flex-1 text-sm font-medium transition-colors",
                      proposalToolbarMenuItemClasses(appearance),
                      proposalToolbarMenuItemHoverClasses(appearance),
                      letterCase !== "uppercase" &&
                        (appearance === "elevated"
                          ? "bg-white/15 text-white"
                          : "bg-muted text-foreground"),
                    )}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().setBlockLetterCase("none").run()}
                  >
                    Ag
                  </button>
                  <button
                    type="button"
                    aria-pressed={letterCase === "uppercase"}
                    className={cn(
                      "flex-1 border-l text-sm font-medium transition-colors",
                      appearance === "elevated" ? "border-white/10" : "border-border",
                      proposalToolbarMenuItemClasses(appearance),
                      proposalToolbarMenuItemHoverClasses(appearance),
                      letterCase === "uppercase" &&
                        (appearance === "elevated"
                          ? "bg-white/15 text-white"
                          : "bg-muted text-foreground"),
                    )}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().setBlockLetterCase("uppercase").run()}
                  >
                    AG
                  </button>
                </div>
              </div>
              <TypographyNumericField
                label="Top spacing"
                value={marginTop}
                min={0}
                max={5}
                step={0.05}
                onChange={(n) => editor.chain().focus().setBlockMarginTop(String(n)).run()}
              />
              <TypographyNumericField
                label="Bottom spacing"
                value={marginBottom}
                min={0}
                max={5}
                step={0.05}
                onChange={(n) => editor.chain().focus().setBlockMarginBottom(String(n)).run()}
              />
            </>
          ) : (
            <p className={cn("px-1 text-xs leading-snug", proposalToolbarHintClasses(appearance))}>
              Place the cursor in a paragraph or heading to adjust spacing.
            </p>
          )}
      </div>
    ) : null;

  return (
    <div className="relative" ref={triggerRef}>
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        aria-label="More typography options"
        aria-expanded={open}
        aria-haspopup="menu"
        className={proposalToolbarBubbleSmallIconButtonClasses(appearance, open)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {typeof document !== "undefined" && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}

export interface ProposalRichTextProps {
  /** Initial HTML; remount the component (key) when switching blocks. */
  html: string;
  onChange: (nextHtml: string) => void;
  placeholder?: string;
  className?: string;
  /**
   * `header`: show the font bubble when the caret is inside a heading even with no
   * text selected (heading blocks use a single line where selection is often empty).
   */
  variant?: "default" | "header";
  /** When set, overrides the compact default minimum height of the editable surface (px). */
  editorMinHeightPx?: number;
  onEditorMinHeightPxChange?: (next: number | undefined) => void;
  /** Show a bottom-right drag handle to change `editorMinHeightPx` (text blocks in the builder). */
  resizableHeight?: boolean;
  /** When true (default), the formatting bubble only appears for a non-empty text selection. */
  bubbleMenuRequiresTextSelection?: boolean;
  /** When true, also show the bubble while this block is selected (drag notch / row chrome). */
  showBubbleWhenBlockSelected?: boolean;
  /**
   * `bubble` (default) — TipTap selection bubble. `band` — fixed toolbar in the
   * single-layout chrome stack (shared with image/pricing controls).
   */
  formattingChrome?: "bubble" | "band";
}

/** Shared formatting controls for rich-text blocks (bubble menu or section-band stack). */
export function RichTextFormattingToolbar({ editor }: { editor: Editor }) {
  return (
    <>
      <HeadingPicker editor={editor} />
      <RichTextToolbarDivider />
      <FontSizeControl editor={editor} />
      <RichTextToolbarDivider />
      <ColorControl editor={editor} />
      <RichTextToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        ariaLabel="Bold"
      >
        <Bold className="h-4 w-4" />
      </RichTextToolbarButton>
      <RichTextToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        ariaLabel="Italic"
      >
        <Italic className="h-4 w-4" />
      </RichTextToolbarButton>
      <RichTextToolbarButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        ariaLabel="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </RichTextToolbarButton>
      <RichTextToolbarButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        ariaLabel="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </RichTextToolbarButton>
      <RichTextToolbarDivider />
      <AlignmentPicker editor={editor} />
      <LinkButton editor={editor} />
      <RichTextToolbarDivider />
      <MergeFieldMenu editor={editor} />
      <RichTextToolbarButton
        ariaLabel="Image from URL"
        onClick={() => {
          const next = window.prompt("Image URL (https)", "https://");
          if (next === null) return;
          const url = next.trim();
          if (!url || !/^https:\/\//i.test(url)) return;
          editor.chain().focus().setImage({ src: url, alt: "" }).run();
        }}
      >
        <ImageIcon className="h-4 w-4" />
      </RichTextToolbarButton>
      <RichTextToolbarDivider />
      <RichTextToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        ariaLabel="Bulleted list"
      >
        <List className="h-4 w-4" />
      </RichTextToolbarButton>
      <RichTextToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        ariaLabel="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </RichTextToolbarButton>
      <RichTextToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        ariaLabel="Pull quote"
      >
        <Quote className="h-4 w-4" />
      </RichTextToolbarButton>
      <RichTextToolbarDivider />
      <TypographyMoreMenu editor={editor} />
    </>
  );
}

const TEXT_EDITOR_RESIZE_MIN_PX = 52;
const TEXT_EDITOR_RESIZE_MAX_PX = 1600;

function TextEditorResizeHandle({
  shellRef,
  onHeightChange,
}: {
  shellRef: React.RefObject<HTMLDivElement | null>;
  onHeightChange: (px: number | undefined) => void;
}) {
  const dragRef = React.useRef<{ startY: number; startH: number } | null>(null);

  return (
    <button
      type="button"
      aria-label="Resize text block height"
      title="Drag to change height · double-click to reset"
      className="absolute bottom-0.5 right-0.5 z-[5] flex h-6 w-6 cursor-nwse-resize touch-none items-end justify-end rounded-sm p-0.5 text-muted-foreground opacity-70 transition-opacity hover:bg-accent/70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        const shell = shellRef.current;
        if (!shell) return;
        e.preventDefault();
        dragRef.current = { startY: e.clientY, startH: shell.getBoundingClientRect().height };
        (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = dragRef.current;
        if (!d) return;
        const next = Math.round(d.startH + (e.clientY - d.startY));
        const clamped = Math.min(TEXT_EDITOR_RESIZE_MAX_PX, Math.max(TEXT_EDITOR_RESIZE_MIN_PX, next));
        onHeightChange(clamped);
      }}
      onPointerUp={(e) => {
        dragRef.current = null;
        try {
          (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
        } catch {
          /* released */
        }
      }}
      onPointerCancel={(e) => {
        dragRef.current = null;
        try {
          (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
        } catch {
          /* released */
        }
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
        onHeightChange(undefined);
      }}
    >
      <span
        className="pointer-events-none mb-px mr-px block h-2.5 w-2.5 rounded-br border-b-[2.5px] border-r-[2.5px] border-current opacity-90"
        aria-hidden
      />
    </button>
  );
}

export function ProposalRichText({
  html,
  onChange,
  placeholder,
  className,
  variant = "default",
  editorMinHeightPx,
  onEditorMinHeightPxChange,
  resizableHeight = false,
  bubbleMenuRequiresTextSelection = true,
  showBubbleWhenBlockSelected = false,
  formattingChrome = "bubble",
}: ProposalRichTextProps) {
  const sectionChrome = useProposalSectionEditorChrome();
  const singleLayoutRichText = useProposalSingleLayoutRichTextEditorOptional();
  const bandFormattingChrome = formattingChrome === "band";
  const toolbarAppearance = useProposalSectionEditorAppearance();
  const seamless = sectionChrome?.seamless ?? false;
  const elevatedSection = sectionChrome?.appearance === "elevated";
  const headerVariant = variant === "header";

  const shellRef = React.useRef<HTMLDivElement | null>(null);

  const resolvedMinHeightPx =
    editorMinHeightPx != null && Number.isFinite(editorMinHeightPx)
      ? Math.min(TEXT_EDITOR_RESIZE_MAX_PX, Math.max(TEXT_EDITOR_RESIZE_MIN_PX, Math.round(editorMinHeightPx)))
      : null;

  const autoMinHeightClass = seamless
    ? headerVariant
      ? "min-h-[2rem]"
      : "min-h-[2.75rem]"
    : headerVariant
      ? "min-h-[3.5rem]"
      : "min-h-[3.25rem]";
  const editorMinHeightStyle =
    resolvedMinHeightPx != null ? (`min-height: ${resolvedMinHeightPx}px` as const) : undefined;

  // No focus ring/border on the editable surface itself — block-level chrome
  // (toolbar + outline) already conveys selection. Browser-default outline is
  // suppressed via `focus-within:outline-none` so removing the ring doesn't
  // expose it.
  const displayTone = seamless && elevatedSection ? "on-dark" : "default";
  const displayLayout = headerVariant ? "heading" : "body";

  const editorRootClass = cn(
    "outline-none",
    proposalRichTextDisplayClasses({ tone: displayTone, layout: displayLayout }),
    seamless
      ? cn(
          "rounded-none border-0 bg-transparent px-2.5 py-1.5 shadow-none focus-within:outline-none",
          "!bg-transparent hover:!bg-transparent focus:!bg-transparent focus-within:!bg-transparent active:!bg-transparent",
          "dark:!bg-transparent dark:hover:!bg-transparent dark:focus:!bg-transparent dark:focus-within:!bg-transparent",
          resolvedMinHeightPx == null ? autoMinHeightClass : null,
        )
      : cn(
          "rounded-lg border-0 bg-background px-2.5 py-1.5 focus-within:outline-none",
          resolvedMinHeightPx == null ? autoMinHeightClass : null,
        ),
    className,
  );

  const extensions = React.useMemo(
    () => createProposalRichTextExtensions({ placeholder: placeholder ?? "Write your section…" }),
    [placeholder],
  );

  const bubbleMenuShouldShow = React.useCallback(
    ({ editor: ed, from, to }: { editor: Editor; from: number; to: number }) => {
      if (!ed.isEditable) return false;
      if (from !== to) return true;
      if (showBubbleWhenBlockSelected) return true;
      if (bubbleMenuRequiresTextSelection) return false;
      if (headerVariant && ed.isActive("heading")) return true;
      return ed.isFocused;
    },
    [showBubbleWhenBlockSelected, bubbleMenuRequiresTextSelection, headerVariant],
  );

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions,
    content: html?.trim() ? html : "<p></p>",
    editorProps: {
      attributes: {
        class: editorRootClass,
        style: editorMinHeightStyle ?? "",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  React.useEffect(() => {
    if (!showBubbleWhenBlockSelected || !editor || bandFormattingChrome) return;
    const id = requestAnimationFrame(() => {
      if (!editor.isDestroyed && !editor.isFocused) editor.commands.focus("end");
    });
    return () => cancelAnimationFrame(id);
  }, [showBubbleWhenBlockSelected, editor, bandFormattingChrome]);

  React.useEffect(() => {
    if (!bandFormattingChrome || !singleLayoutRichText || !editor) return;
    singleLayoutRichText.setEditor(editor);
    return () => {
      singleLayoutRichText.setEditor(null);
    };
  }, [bandFormattingChrome, singleLayoutRichText, editor]);

  React.useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        attributes: {
          class: editorRootClass,
          style: editorMinHeightStyle ?? "",
        },
      },
    });
  }, [editor, editorRootClass, editorMinHeightStyle]);

  if (!editor) {
    return (
      <div
        className={cn(
          "proposal-rich-text-skel animate-pulse rounded-lg",
          resolvedMinHeightPx == null ? autoMinHeightClass : null,
          // Inside a section the surface stays the section's chosen colour — any
          // skeleton tint reads as a coloured rectangle layered on top, which
          // looked like the editor itself had a different fill.
          seamless ? "bg-transparent" : "bg-muted/40",
        )}
        style={resolvedMinHeightPx != null ? { minHeight: resolvedMinHeightPx } : undefined}
      />
    );
  }

  const showResize =
    resizableHeight && !headerVariant && typeof onEditorMinHeightPxChange === "function";

  return (
    <div className="relative" ref={shellRef}>
      {!bandFormattingChrome ? (
        <BubbleMenu
          editor={editor}
          options={BUBBLE_MENU_FLOATING_OPTIONS}
          shouldShow={bubbleMenuShouldShow}
        >
          <div
            className={cn(
              "flex w-max flex-nowrap items-center gap-0.5 rounded-lg border p-1",
              proposalToolbarShellClasses(toolbarAppearance),
            )}
          >
            <RichTextFormattingToolbar editor={editor} />
          </div>
        </BubbleMenu>
      ) : null}
      <EditorContent editor={editor} />
      {showResize ? (
        <TextEditorResizeHandle shellRef={shellRef} onHeightChange={onEditorMinHeightPxChange} />
      ) : null}
    </div>
  );
}
