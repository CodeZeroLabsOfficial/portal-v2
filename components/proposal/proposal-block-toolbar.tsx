"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  EllipsisVertical,
  Palette,
  Settings2,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DEFAULT_AGREEMENT_BUTTON_COLOR,
  DEFAULT_PRIMARY_COLOR,
  STYLE_PRESET_COLORS,
  resolveBlockStyle,
} from "@/lib/proposal/block-style";
import {
  ProposalToolbarIconButton,
  ProposalToolbarSectionLabel,
  ProposalToolbarSeparator,
  ProposalToolbarShell,
} from "@/components/features/proposal/editor/toolbar";
import { useResolvedProposalToolbarAppearance } from "@/components/proposal/proposal-section-editor-chrome";
import {
  type ProposalToolbarAppearance,
  PROPOSAL_TOOLBAR_TOKENS,
  proposalToolbarPanelClasses,
} from "@/lib/proposal/editor-toolbar-tokens";
import { cn } from "@/lib/utils";
import type { BlockStyle } from "@/types/proposal";

export interface ProposalBlockToolbarProps {
  /** Controls palette + icon treatments. `elevated` is a dark floating bar; `surface` is a soft light pill aligned with editorial chrome. */
  appearance?: ProposalToolbarAppearance;
  blockType: "pricing" | "packages" | "agreement" | "section" | "other";
  deleteLabel?: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  /** Optional control rendered at the start of the pill (e.g. drag handle on the left). */
  leadingSlot?: React.ReactNode;
  /** More menu (ellipsis) — only rendered when {@link overflowLeadingAction} or {@link overflowExtraItems} are set. Duplicate/delete are always inline. */
  showOverflowMenu?: boolean;
  /** Optional trailing control inside the pill (e.g. drag handle with sortable listeners). */
  trailingSlot?: React.ReactNode;
  /** Optional toggle shown after the overflow menu — used for reversible layout previews. */
  auxiliarySlot?: React.ReactNode;
  /**
   * Shown as the first item in the overflow menu (before Duplicate). Used e.g. for
   * removing the Plans add-ons sub-table without deleting the whole block.
   */
  overflowLeadingAction?: { label: string; onClick: () => void };
  /** Extra items after {@link overflowLeadingAction}, still before Duplicate. */
  overflowExtraItems?: Array<{ label: string; onClick: () => void; destructive?: boolean }>;
  onOpenSettings?: () => void;
  style?: BlockStyle;
  onStyleChange?: (next: BlockStyle | undefined) => void;
  backdropPickerSlot?: React.ReactNode;
  /**
   * When true, only leading slot → primary slot → delete → trailing slot (omit move /
   * duplicate / overflow chrome). Used for Columns blocks.
   */
  compactChrome?: boolean;
  /** Inserted between leading area and Delete when compactChrome — e.g. “Edit columns”. */
  compactPrimarySlot?: React.ReactNode;
}

export function ProposalBlockToolbar({
  appearance: appearanceProp,
  blockType,
  deleteLabel = "Delete block",
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  showOverflowMenu = true,
  leadingSlot,
  trailingSlot,
  auxiliarySlot,
  overflowLeadingAction,
  overflowExtraItems,
  onOpenSettings,
  style,
  onStyleChange,
  backdropPickerSlot,
  compactChrome = false,
  compactPrimarySlot,
}: ProposalBlockToolbarProps) {
  const appearance = useResolvedProposalToolbarAppearance(appearanceProp);
  const supportsStyle =
    (blockType === "packages" || blockType === "pricing" || blockType === "agreement") &&
    typeof onStyleChange === "function";
  const stylePickerMode: StylePickerMode = blockType === "agreement" ? "agreement" : "packages";

  const hasOverflowMenuItems =
    Boolean(overflowLeadingAction) || (overflowExtraItems?.length ?? 0) > 0;
  const showOverflowDropdown = Boolean(showOverflowMenu && hasOverflowMenuItems);

  return (
    <ProposalToolbarShell
      appearance={appearance}
      className="pointer-events-auto p-1"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {leadingSlot ? (
        <>
          <span className="inline-flex items-center">{leadingSlot}</span>
          <ToolbarDivider appearance={appearance} />
        </>
      ) : null}
      {compactChrome ? (
        <>
          {compactPrimarySlot ? (
            <span className="inline-flex max-w-[min(100vw-6rem,28rem)] flex-wrap items-center gap-1 sm:max-w-none">
              {compactPrimarySlot}
            </span>
          ) : null}
          <ToolbarDivider appearance={appearance} />
        </>
      ) : (
        <>
          {backdropPickerSlot ? (
            <>
              <span className="inline-flex items-center">{backdropPickerSlot}</span>
              <ToolbarDivider appearance={appearance} />
            </>
          ) : null}
          {auxiliarySlot ? (
            <>
              <span className="inline-flex items-center">{auxiliarySlot}</span>
              <ToolbarDivider appearance={appearance} />
            </>
          ) : null}
          <ProposalToolbarIconButton
            appearance={appearance}
            aria-label="Move up"
            title="Move up"
            disabled={!canMoveUp}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
          >
            <ArrowUp className="h-4 w-4" />
          </ProposalToolbarIconButton>
          <ProposalToolbarIconButton
            appearance={appearance}
            aria-label="Move down"
            title="Move down"
            disabled={!canMoveDown}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
          >
            <ArrowDown className="h-4 w-4" />
          </ProposalToolbarIconButton>
          <ProposalToolbarSeparator appearance={appearance} />
          <ProposalToolbarIconButton
            appearance={appearance}
            aria-label="Duplicate"
            title="Duplicate"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="h-4 w-4" />
          </ProposalToolbarIconButton>
          {supportsStyle ? (
            <StylePickerTrigger
              style={style}
              onStyleChange={onStyleChange!}
              appearance={appearance}
              mode={stylePickerMode}
            />
          ) : null}
          {onOpenSettings ? (
            <ProposalToolbarIconButton
              appearance={appearance}
              aria-label="Block options"
              title="Block options"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings();
              }}
            >
              <Settings2 className="h-4 w-4" />
            </ProposalToolbarIconButton>
          ) : null}
          {showOverflowDropdown ? (
            <>
              <ToolbarDivider appearance={appearance} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ProposalToolbarIconButton
                    appearance={appearance}
                    aria-label="More actions"
                    title="More"
                  >
                    <EllipsisVertical className="h-4 w-4" />
                  </ProposalToolbarIconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={6} className="min-w-[10rem]" onCloseAutoFocus={(e) => e.preventDefault()}>
                  {overflowLeadingAction ? (
                    <>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          overflowLeadingAction.onClick();
                        }}
                      >
                        {overflowLeadingAction.label}
                      </DropdownMenuItem>
                      {overflowExtraItems && overflowExtraItems.length > 0 ? <DropdownMenuSeparator /> : null}
                    </>
                  ) : null}
                  {overflowExtraItems?.map((item, itemIdx) => (
                    <DropdownMenuItem
                      key={`${item.label}-${itemIdx}`}
                      className={cn(
                        "cursor-pointer",
                        item.destructive && "text-destructive focus:text-destructive",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onClick();
                      }}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : null}
          <ToolbarDivider appearance={appearance} />
        </>
      )}
      <ProposalToolbarIconButton
        appearance={appearance}
        aria-label={deleteLabel}
        title={deleteLabel}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={
          appearance === "elevated"
            ? "hover:bg-red-500/20 hover:text-red-300 dark:hover:bg-red-500/20 dark:hover:text-red-300"
            : "text-destructive hover:bg-red-500/15 hover:text-destructive dark:hover:bg-red-500/15 dark:hover:text-destructive"
        }
      >
        <Trash2 className="h-4 w-4" />
      </ProposalToolbarIconButton>
      {trailingSlot ? (
        <>
          <ToolbarDivider appearance={appearance} />
          <span className="inline-flex items-center">{trailingSlot}</span>
        </>
      ) : null}
    </ProposalToolbarShell>
  );
}

function ToolbarDivider({ appearance }: { appearance: ProposalToolbarAppearance }) {
  return <ProposalToolbarSeparator appearance={appearance} />;
}

/**
 * `packages` exposes the full editor (variant + primary + highlight). `agreement`
 * exposes a focused picker with a single "Button color" row + reset — same chrome,
 * different defaults so the mint accent doesn't surface a purple swatch on first
 * open.
 */
type StylePickerMode = "packages" | "agreement";

function pickerDefaultPrimary(mode: StylePickerMode): string {
  return mode === "agreement" ? DEFAULT_AGREEMENT_BUTTON_COLOR : DEFAULT_PRIMARY_COLOR;
}

function StylePickerTrigger({
  style,
  onStyleChange,
  appearance,
  mode = "packages",
}: {
  style?: BlockStyle;
  onStyleChange: (next: BlockStyle | undefined) => void;
  appearance: ProposalToolbarAppearance;
  mode?: StylePickerMode;
}) {
  const triggerColor =
    mode === "agreement"
      ? (style?.primaryColor?.trim() || DEFAULT_AGREEMENT_BUTTON_COLOR)
      : resolveBlockStyle(style).primaryColor;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ProposalToolbarIconButton
          appearance={appearance}
          aria-label={mode === "agreement" ? "Button color" : "Style"}
          title={mode === "agreement" ? "Button color" : "Style"}
          className="relative data-[state=open]:bg-[var(--proposal-toolbar-active-bg)]"
        >
          <Palette className="h-4 w-4" />
          <span
            className={cn(
              "absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full ring-1",
              appearance === "elevated" ? "ring-zinc-900" : "ring-background",
            )}
            style={{ backgroundColor: triggerColor }}
            aria-hidden
          />
        </ProposalToolbarIconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        sideOffset={8}
        className={cn("w-72 border p-0", proposalToolbarPanelClasses(appearance))}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <StylePickerPanel
          style={style}
          onStyleChange={onStyleChange}
          appearance={appearance}
          mode={mode}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StylePickerPanel({
  style,
  onStyleChange,
  appearance,
  mode = "packages",
}: {
  style?: BlockStyle;
  onStyleChange: (next: BlockStyle | undefined) => void;
  appearance: ProposalToolbarAppearance;
  mode?: StylePickerMode;
}) {
  const frame =
    appearance === "elevated" ? "bg-zinc-800/80 ring-zinc-700/60" : "bg-muted/60 ring-border";

  const resetButton = (
    <button
      type="button"
      onClick={() => onStyleChange(undefined)}
      className={cn(
        "w-full rounded-md border px-2 py-1.5 font-medium transition-colors",
        PROPOSAL_TOOLBAR_TOKENS.surface.menuItemCompact,
        appearance === "elevated"
          ? "border-zinc-700/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      Reset to default
    </button>
  );

  if (mode === "agreement") {
    const buttonColor = style?.primaryColor?.trim() || pickerDefaultPrimary(mode);
    return (
      <div className="space-y-4 p-3">
        <ColorRow
          appearance={appearance}
          label="Button color"
          value={buttonColor}
          onChange={(v) => onStyleChange({ ...(style ?? {}), primaryColor: v })}
        />
        {resetButton}
      </div>
    );
  }

  const resolved = resolveBlockStyle(style);

  function patch(next: Partial<BlockStyle>) {
    const merged: BlockStyle = {
      variant: resolved.variant,
      primaryColor: resolved.primaryColor,
      tableBackground: resolved.tableBackground,
      ...style,
      ...next,
    };
    onStyleChange(merged);
  }

  return (
    <div className="space-y-4 p-3">
      <div>
        <ProposalToolbarSectionLabel appearance={appearance}>
          Presentation
        </ProposalToolbarSectionLabel>
        <div className={cn("mt-2 inline-flex w-full rounded-lg p-0.5 ring-1", frame)}>
          <VariantPill
            label="Visual"
            active={resolved.variant === "visual"}
            onClick={() => patch({ variant: "visual" })}
            appearance={appearance}
          />
          <VariantPill
            label="Simple"
            active={resolved.variant === "simple"}
            onClick={() => patch({ variant: "simple" })}
            appearance={appearance}
          />
        </div>
      </div>

      <ColorRow
        appearance={appearance}
        label="Primary color"
        value={resolved.primaryColor}
        onChange={(v) => patch({ primaryColor: v })}
      />

      <ColorRow
        appearance={appearance}
        label="Table background"
        value={resolved.tableBackground}
        onChange={(v) => patch({ tableBackground: v })}
      />

      {resetButton}
    </div>
  );
}

function VariantPill({
  label,
  active,
  onClick,
  appearance,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  appearance: ProposalToolbarAppearance;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        appearance === "elevated"
          ? active
            ? "bg-zinc-700 text-white shadow-sm"
            : "text-zinc-400 hover:text-white"
          : active
            ? "bg-background text-foreground shadow-sm ring-1 ring-border"
            : "text-muted-foreground hover:text-foreground",
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function ColorRow({
  appearance,
  label,
  value,
  onChange,
}: {
  appearance: ProposalToolbarAppearance;
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const ringActive = appearance === "elevated" ? "ring-offset-zinc-900" : "ring-offset-background";
  const swatchIdle =
    appearance === "elevated" ? "border-zinc-700 hover:scale-105" : "border-border hover:scale-105";
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => setDraft(value), [value]);

  function commitDraft() {
    const next = normalizeColorInput(draft);
    if (next) onChange(next);
    else setDraft(value);
  }

  return (
    <div>
      <ProposalToolbarSectionLabel appearance={appearance} className="mt-0">
        {label}
      </ProposalToolbarSectionLabel>
      <div className="mt-2 grid grid-cols-6 gap-2">
        {STYLE_PRESET_COLORS.map((c) => {
          const isActive = sameColor(c.value, value);
          return (
            <button
              key={c.value}
              type="button"
              aria-label={c.label}
              title={c.label}
              onClick={() => onChange(c.value)}
              className={cn(
                "relative h-8 w-8 rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? cn("ring-2 ring-ring ring-offset-2", ringActive) : swatchIdle,
              )}
              style={{ backgroundColor: c.value }}
            >
              {isActive ? (
                <Check
                  className={cn(
                    "absolute inset-0 m-auto h-4 w-4",
                    needsLightCheck(c.value) ? "text-white" : "text-zinc-900",
                  )}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
      <div
        className={cn(
          "mt-2 flex items-center gap-2 rounded-lg border p-1.5",
          appearance === "elevated" ? "border-zinc-700/60 bg-zinc-800/60" : "border-border bg-muted/40",
        )}
      >
        <span
          className={cn(
            "h-6 w-6 shrink-0 rounded-full ring-1",
            appearance === "elevated" ? "ring-zinc-700" : "ring-border",
          )}
          style={{ backgroundColor: value }}
          aria-hidden
        />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          spellCheck={false}
          className={cn(
            "w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground",
            appearance === "elevated" ? "text-zinc-100" : "text-foreground",
          )}
          aria-label={`${label} hex value`}
          placeholder="#15141F"
        />
      </div>
    </div>
  );
}

function needsLightCheck(hex: string): boolean {
  if (hex.toUpperCase() === "#FFFFFF" || hex.toUpperCase() === "#FFF") return false;
  if (hex.toUpperCase() === "#E2E8F0") return false;
  return true;
}

function sameColor(a: string, b: string): boolean {
  return normalizeHex(a) === normalizeHex(b);
}

function normalizeHex(input: string): string {
  return input.trim().toLowerCase();
}

function normalizeColorInput(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  if (/^#?[0-9a-fA-F]{3}$/.test(v)) return `#${v.replace("#", "")}`;
  if (/^#?[0-9a-fA-F]{6}$/.test(v)) return `#${v.replace("#", "")}`;
  if (/^[a-zA-Z]{3,32}$/.test(v)) return v.toLowerCase();
  return null;
}
