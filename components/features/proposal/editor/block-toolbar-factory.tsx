"use client";

import * as React from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";

import { getBlockDefinition } from "@/components/features/proposal/blocks/block-editor-registry";
import { ColumnsBlockToolbarPrimarySlot } from "@/components/proposal/columns-block-layout-controls";
import { ProposalBlockToolbar } from "@/components/proposal/proposal-block-toolbar";
import { ProposalImageBlockToolbar } from "@/components/proposal/proposal-image-block-toolbar";
import { ProposalSectionBackgroundPicker } from "@/components/proposal/proposal-section-background-picker";
import { useProposalSectionEditorAppearance } from "@/components/proposal/proposal-section-editor-chrome";
import { ProposalSplashBackgroundPickerWithBranding } from "@/components/proposal/proposal-splash-editor";
import { ProposalToolbarDragHandle } from "@/components/features/proposal/editor/toolbar";
import { packagesAddonsSectionActive } from "@/lib/proposal/commerce/packages-totals";
import { proposalToolbarAuxTextButtonClasses } from "@/lib/proposal/editor-toolbar-tokens";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

function blockLabel(type: ProposalBlock["type"]): string {
  return getBlockDefinition(type)?.label ?? "Block";
}

/** Reversible "remove add-ons table" toggle promoted into the visible toolbar row. */
export function PackagesRemoveAddonsButton({ onClick }: { onClick: () => void }) {
  const appearance = useProposalSectionEditorAppearance();
  return (
    <Tooltip delayDuration={320}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={proposalToolbarAuxTextButtonClasses(appearance, { compact: true })}
          onClick={onClick}
          aria-label="Remove add-ons table"
        >
          Remove add-ons
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        Remove the add-ons sub-table from this Packages block
      </TooltipContent>
    </Tooltip>
  );
}

export interface RootBlockToolbarContext {
  block: ProposalBlock;
  index: number;
  blockCount: number;
  dragAttributes: DraggableAttributes;
  dragListeners: DraggableSyntheticListeners;
  rootColumnsLayoutEditingId: string | null;
  setRootColumnsLayoutEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  updateBlock: (id: string, next: ProposalBlock) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, direction: -1 | 1) => void;
  duplicateBlock: (id: string) => void;
  applyBlockStyle: (id: string, style: BlockStyle | undefined) => void;
  patchBlockBackground: (id: string, background: SectionBackground | undefined) => void;
  getBlockStyle: (b: ProposalBlock) => BlockStyle | undefined;
  /** Agreement CTA / e-sign controls live in the fields module; injected to avoid a cycle. */
  renderAgreementAux: (block: AgreementBlock, onChange: (next: AgreementBlock) => void) => React.ReactNode;
}

/** Root-level block toolbar (move across document, backdrop pickers, section/splash chrome). */
export function buildRootBlockToolbar(ctx: RootBlockToolbarContext): React.ReactNode {
  const {
    block,
    index,
    blockCount,
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
  } = ctx;

  const isSection = block.type === "section";
  const supportsStyle = block.type === "packages" || block.type === "pricing";
  const dragHandle = (
    <ProposalToolbarDragHandle
      ariaLabel={`Reorder ${blockLabel(block.type)}`}
      tooltip="Drag to reposition · arrows nudge precisely"
      dragAttributes={dragAttributes}
      dragListeners={dragListeners}
    />
  );

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

  const compactColumnsChrome = block.type === "columns";

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
      canMoveUp={index > 0}
      canMoveDown={index < blockCount - 1}
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
        block.type === "packages" && packagesAddonsSectionActive(block as PackagesBlock)
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
        block.type === "agreement"
          ? renderAgreementAux(block as AgreementBlock, (next) => updateBlock(block.id, next))
          : undefined
      }
      showOverflowMenu={!isSection && block.type !== "splash"}
      style={supportsStyle ? getBlockStyle(block) : undefined}
      onStyleChange={supportsStyle ? (next) => applyBlockStyle(block.id, next) : undefined}
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
}

export interface SectionChildToolbarContext {
  child: ProposalBlock;
  index: number;
  childCount: number;
  dragAttributes: DraggableAttributes;
  dragListeners: DraggableSyntheticListeners;
  columnsLayoutEditingId: string | null;
  setColumnsLayoutEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  updateChild: (id: string, next: ProposalBlock) => void;
  removeChild: (id: string) => void;
  moveChild: (id: string, direction: -1 | 1) => void;
  duplicateChild: (id: string) => void;
  applyBlockStyle: (id: string, style: BlockStyle | undefined) => void;
  getBlockStyle: (b: ProposalBlock) => BlockStyle | undefined;
  /** Agreement children are not allowed inside agreement bands; only set for Section stacks. */
  renderAgreementAux?: (block: AgreementBlock, onChange: (next: AgreementBlock) => void) => React.ReactNode;
}

/** Toolbar for a block nested in a Section or Agreement stack (shared by both). */
export function buildSectionChildToolbar(ctx: SectionChildToolbarContext): React.ReactNode {
  const {
    child,
    index,
    childCount,
    dragAttributes,
    dragListeners,
    columnsLayoutEditingId,
    setColumnsLayoutEditingId,
    updateChild,
    removeChild,
    moveChild,
    duplicateChild,
    applyBlockStyle,
    getBlockStyle,
    renderAgreementAux,
  } = ctx;

  const supportsStyle = child.type === "packages" || child.type === "pricing";

  if (child.type === "image") {
    const ib = child as ImageBlock;
    return (
      <ProposalImageBlockToolbar
        variant="shell"
        block={ib}
        onChange={(next) => updateChild(child.id, next)}
        onDelete={() => removeChild(child.id)}
      />
    );
  }

  const compactColumnsChrome = child.type === "columns";
  const agreementMenu =
    child.type === "agreement" && renderAgreementAux
      ? renderAgreementAux(child as AgreementBlock, (next) => updateChild(child.id, next))
      : null;
  const packagesSlot =
    child.type === "packages" && packagesAddonsSectionActive(child as PackagesBlock) ? (
      <PackagesRemoveAddonsButton
        onClick={() => {
          const p = child as PackagesBlock;
          updateChild(child.id, { ...p, addonsSectionEnabled: false });
        }}
      />
    ) : null;
  const auxiliarySlot =
    agreementMenu || packagesSlot ? (
      <span className="inline-flex flex-wrap items-center gap-1">
        {agreementMenu}
        {packagesSlot}
      </span>
    ) : undefined;

  return (
    <ProposalBlockToolbar
      blockType={
        child.type === "pricing"
          ? "pricing"
          : child.type === "packages"
            ? "packages"
            : child.type === "agreement"
              ? "agreement"
              : "other"
      }
      canMoveUp={index > 0}
      canMoveDown={index < childCount - 1}
      onMoveUp={() => moveChild(child.id, -1)}
      onMoveDown={() => moveChild(child.id, 1)}
      onDuplicate={() => duplicateChild(child.id)}
      deleteLabel="Remove block"
      onDelete={() => removeChild(child.id)}
      compactChrome={compactColumnsChrome}
      compactPrimarySlot={
        compactColumnsChrome ? (
          <ColumnsBlockToolbarPrimarySlot
            block={child as ColumnsBlock}
            editing={columnsLayoutEditingId === child.id}
            onStartEdit={() => setColumnsLayoutEditingId(child.id)}
            onEndEdit={() => setColumnsLayoutEditingId(null)}
            onPatch={(patch) => {
              if (child.type !== "columns") return;
              updateChild(child.id, { ...child, ...patch });
            }}
          />
        ) : undefined
      }
      showOverflowMenu={false}
      auxiliarySlot={auxiliarySlot}
      style={supportsStyle ? getBlockStyle(child) : undefined}
      onStyleChange={supportsStyle ? (next) => applyBlockStyle(child.id, next) : undefined}
      backdropPickerSlot={
        child.type === "splash" ? (
          <ProposalSplashBackgroundPickerWithBranding
            block={child as SplashBlock}
            onChange={(next) => updateChild(child.id, next)}
          />
        ) : child.type === "packages" ? (
          <ProposalSectionBackgroundPicker
            background={(child as PackagesBlock).background}
            onChange={(next) => {
              const p = child as PackagesBlock;
              if (!next) {
                const { background: _b, ...rest } = p;
                void _b;
                updateChild(child.id, rest as PackagesBlock);
              } else {
                updateChild(child.id, { ...p, background: next });
              }
            }}
          />
        ) : undefined
      }
      leadingSlot={undefined}
    />
  );
}
