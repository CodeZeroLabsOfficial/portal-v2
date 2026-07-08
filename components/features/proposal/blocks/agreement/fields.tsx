"use client";

import * as React from "react";
import { arrayMove } from "@dnd-kit/sortable";
import {
  AlignCenter,
  AlignLeft,
  Check,
  Pencil,
  Plus,
} from "lucide-react";
import type {
  AgreementBlock,
  BlockStyle,
  PackagesBlock,
  ProposalAgreementChildBlock,
  ProposalBlock,
} from "@/types/proposal";
import { ProposalSectionShell } from "@/components/features/proposal/editor/section-chrome/proposal-section-shell";
import { useProposalSectionEditorAppearance } from "@/components/features/proposal/editor/section-chrome/proposal-section-editor-chrome";
import { BlockToolbarForBlock } from "@/components/features/proposal/editor/block-toolbar-factory";
import { SectionChildStack } from "@/components/features/proposal/editor/section-child-stack";
import { SectionInsertMenu } from "@/components/features/proposal/editor/block-insert-menus";
import { cloneBlockWithFreshIds } from "@/components/features/proposal/editor/block-field-utils";
import { useColumnsInnerCellChrome } from "@/components/features/proposal/editor/columns-inner-cell-chrome";
import { ProposalBlockFields } from "@/components/features/proposal/editor/proposal-block-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  proposalAgreementCtaEditChipClasses,
} from "@/lib/proposal/editor-toolbar-tokens";
import { cn } from "@/lib/utils";
import {
  DEFAULT_AGREEMENT_BUTTON_COLOR,
  readableForeground,
  resolveAgreementButtonColor,
  STYLE_PRESET_COLORS,
} from "@/lib/proposal/block-style";
import { resolveSectionBackground } from "@/lib/proposal/section-background";

export function agreementNormalizeColorInput(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  if (/^#?[0-9a-fA-F]{3}$/.test(v)) return `#${v.replace("#", "")}`;
  if (/^#?[0-9a-fA-F]{6}$/.test(v)) return `#${v.replace("#", "")}`;
  if (/^[a-zA-Z]{3,32}$/.test(v)) return v.toLowerCase();
  return null;
}

export function agreementNormalizeHexForCompare(s: string): string {
  const v = s.trim().replace(/^#/, "").toLowerCase();
  if (v.length === 3 && /^[0-9a-f]{3}$/.test(v)) {
    return `${v[0]}${v[0]}${v[1]}${v[1]}${v[2]}${v[2]}`;
  }
  return v.length === 6 && /^[0-9a-f]{6}$/.test(v) ? v : "";
}

export function agreementSwatchIsActive(swatch: string, current: string): boolean {
  const a = agreementNormalizeHexForCompare(swatch);
  const b = agreementNormalizeHexForCompare(current);
  return a !== "" && b !== "" && a === b;
}

export function agreementHexForNativeColorInput(hex: string): string {
  const v = hex.trim().replace(/^#/, "");
  if (v.length === 3 && /^[0-9a-fA-F]{3}$/.test(v)) {
    return `#${v[0]}${v[0]}${v[1]}${v[1]}${v[2]}${v[2]}`.toLowerCase();
  }
  if (v.length === 6 && /^[0-9a-fA-F]{6}$/.test(v)) return `#${v.toLowerCase()}`;
  return DEFAULT_AGREEMENT_BUTTON_COLOR;
}

export function agreementNeedsLightCheck(hex: string): boolean {
  if (hex.toUpperCase() === "#FFFFFF" || hex.toUpperCase() === "#FFF") return false;
  if (hex.toUpperCase() === "#E2E8F0") return false;
  return true;
}

export function AgreementSignButtonPreview({
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
export function AgreementBlockEditor({
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
