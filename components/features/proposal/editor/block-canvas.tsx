"use client";

import * as React from "react";

import { DividerBlockEditor } from "@/components/features/proposal/blocks/divider/editor";
import { EmbedBlockEditor } from "@/components/features/proposal/blocks/embed/editor";
import { FormBlockEditor } from "@/components/features/proposal/blocks/form/editor";
import { HeaderBlockEditor } from "@/components/features/proposal/blocks/header/editor";
import { IconBlockEditor } from "@/components/features/proposal/blocks/icon/editor";
import { ImageBlockEditor } from "@/components/features/proposal/blocks/image/editor";
import { PaymentBlockEditor } from "@/components/features/proposal/blocks/payment/editor";
import { SignatureBlockEditor } from "@/components/features/proposal/blocks/signature/editor";
import { SpacerBlockEditor } from "@/components/features/proposal/blocks/spacer/editor";
import { SplashBlockEditor } from "@/components/features/proposal/blocks/splash/editor";
import { TextBlockEditor } from "@/components/features/proposal/blocks/text/editor";
import { VideoBlockEditor } from "@/components/features/proposal/blocks/video/editor";
import { PricingBlockEditor } from "@/components/features/proposal/blocks/pricing/editor";
import { PackagesBlockEditor } from "@/components/features/proposal/blocks/packages/editor";
import { AccordionBlockEditor } from "@/components/features/proposal/blocks/accordion/editor";
import { ColumnsBlockEditor } from "@/components/features/proposal/blocks/columns/editor";
import { SectionBlockEditor } from "@/components/features/proposal/blocks/section/editor";
import { AgreementBlockEditor } from "@/components/features/proposal/blocks/agreement/editor";
import { getBlockDefinition } from "@/components/features/proposal/blocks/block-editor-registry";
import type {
  AccordionBlock,
  AgreementBlock,
  BlockStyle,
  ColumnsBlock,
  DividerBlock,
  FormBlock,
  HeaderBlock,
  IconBlock,
  ImageBlock,
  PackagesBlock,
  PricingBlock,
  ProposalBlock,
  SectionBlock,
  SignatureBlock,
  SpacerBlock,
  SplashBlock,
  TextBlock,
  VideoBlock,
} from "@/types/proposal";

export interface ProposalColumnImageToolbarActions {
  onRemove: () => void;
}

export interface ProposalColumnIconToolbarActions {
  onRemove: () => void;
}

export interface ProposalBlockCanvasProps {
  block: ProposalBlock;
  onChange: (next: ProposalBlock) => void;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  /** Rich-text placeholder when editing inside a column cell. */
  textPlaceholder?: string;
  /** Wrap rich-text blocks when editing inside a seamless section band. */
  seamlessSection?: boolean;
  /** When set, wraps output in section-child editable surface (stops row selection). */
  editableSurface?: "section-child" | "column-cell" | null;
  /** Columns only: image remove is on the floating toolbar when the cell is selected. */
  imageColumnToolbar?: ProposalColumnImageToolbarActions;
  /** Columns only: icon picker + remove on the floating toolbar when the cell is selected. */
  iconColumnToolbar?: ProposalColumnIconToolbarActions;
  /** When true, rich-text uses the shared single-section band toolbar instead of a floating bubble. */
  singleSectionBand?: boolean;
  getBlockStyle?: (b: ProposalBlock) => BlockStyle | undefined;
  applyBlockStyle?: (id: string, style: BlockStyle | undefined) => void;
  columnsLayoutEditing?: {
    activeId: string | null;
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
  };
  columnsInnerCellCallbacks?: {
    onInnerCellActiveChange: (cellId: string | null) => void;
    registerClearCellSelection: (clear: (() => void) | null) => void;
  };
}

function BlockEditableSurface({
  enabled,
  marker,
  children,
}: {
  enabled: boolean;
  marker: "section-child" | "column-cell";
  children: React.ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <div
      {...(marker === "column-cell"
        ? { "data-proposal-column-cell-content": true }
        : { "data-proposal-section-child-content": true })}
      className="min-w-0"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function isRegistryCanvasBlock(type: ProposalBlock["type"]): boolean {
  return Boolean(getBlockDefinition(type)?.Editor);
}

/**
 * Dispatches to the block-editor registry `Editor` for the given block type.
 */
export function ProposalBlockCanvas({
  block,
  onChange,
  selectedBlockId,
  onSelectBlock,
  seamlessSection = false,
  editableSurface = null,
  textPlaceholder,
  imageColumnToolbar,
  iconColumnToolbar,
  singleSectionBand = false,
  getBlockStyle,
  applyBlockStyle,
  columnsLayoutEditing,
  columnsInnerCellCallbacks,
}: ProposalBlockCanvasProps): React.ReactNode {
  if (!isRegistryCanvasBlock(block.type)) return null;

  const wrapRichText = (node: React.ReactNode) => {
    if (!editableSurface) return node;
    const enabled = editableSurface === "column-cell" ? true : seamlessSection;
    return (
      <BlockEditableSurface enabled={enabled} marker={editableSurface}>
        {node}
      </BlockEditableSurface>
    );
  };

  switch (block.type) {
    case "text":
      return wrapRichText(
        <TextBlockEditor
          block={block as TextBlock}
          onChange={onChange as (next: TextBlock) => void}
          placeholder={textPlaceholder}
          showBubbleWhenBlockSelected={!singleSectionBand && selectedBlockId === block.id}
          formattingChrome={singleSectionBand ? "band" : "bubble"}
        />,
      );
    case "header":
      return wrapRichText(
        <HeaderBlockEditor
          block={block as HeaderBlock}
          onChange={onChange as (next: HeaderBlock) => void}
          showBubbleWhenBlockSelected={!singleSectionBand && selectedBlockId === block.id}
          formattingChrome={singleSectionBand ? "band" : "bubble"}
        />,
      );
    case "divider":
      return <DividerBlockEditor block={block as DividerBlock} onChange={onChange} />;
    case "spacer":
      return (
        <SpacerBlockEditor block={block as SpacerBlock} onChange={onChange as (next: SpacerBlock) => void} />
      );
    case "splash":
      return (
        <SplashBlockEditor block={block as SplashBlock} onChange={onChange as (next: SplashBlock) => void} />
      );
    case "image":
      return (
        <ImageBlockEditor
          block={block as ImageBlock}
          onChange={onChange as (next: ImageBlock) => void}
          selectedBlockId={selectedBlockId}
          columnToolbar={imageColumnToolbar}
        />
      );
    case "video":
      return (
        <VideoBlockEditor block={block as VideoBlock} onChange={onChange as (next: VideoBlock) => void} />
      );
    case "icon":
      return (
        <IconBlockEditor
          block={block as IconBlock}
          onChange={onChange as (next: IconBlock) => void}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
          columnToolbar={iconColumnToolbar}
        />
      );
    case "form":
      return <FormBlockEditor block={block as FormBlock} onChange={onChange as (next: FormBlock) => void} />;
    case "signature":
      return (
        <SignatureBlockEditor
          block={block as SignatureBlock}
          onChange={onChange as (next: SignatureBlock) => void}
        />
      );
    case "embed":
      return <EmbedBlockEditor block={block as Extract<ProposalBlock, { type: "embed" }>} onChange={onChange} />;
    case "payment":
      return <PaymentBlockEditor block={block as Extract<ProposalBlock, { type: "payment" }>} onChange={onChange} />;
    case "pricing":
      return (
        <PricingBlockEditor block={block as PricingBlock} onChange={onChange as (next: PricingBlock) => void} />
      );
    case "packages":
      return (
        <PackagesBlockEditor block={block as PackagesBlock} onChange={onChange as (next: PackagesBlock) => void} />
      );
    case "section":
      return (
        <SectionBlockEditor
          block={block as SectionBlock}
          onChange={onChange as (next: SectionBlock) => void}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
          getBlockStyle={getBlockStyle}
          applyBlockStyle={applyBlockStyle}
        />
      );
    case "agreement":
      return (
        <AgreementBlockEditor
          block={block as AgreementBlock}
          onChange={onChange as (next: AgreementBlock) => void}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
          getBlockStyle={getBlockStyle}
          applyBlockStyle={applyBlockStyle}
        />
      );
    case "columns":
      return (
        <ColumnsBlockEditor
          block={block as ColumnsBlock}
          onChange={onChange as (next: ColumnsBlock) => void}
          resizeLayoutActive={columnsLayoutEditing?.activeId === block.id}
          onExitResizeLayout={() => columnsLayoutEditing?.setActiveId(null)}
          ancestorSelectedBlockId={selectedBlockId ?? null}
          onInnerCellActiveChange={columnsInnerCellCallbacks?.onInnerCellActiveChange}
          registerClearCellSelection={columnsInnerCellCallbacks?.registerClearCellSelection}
        />
      );
    case "accordion":
      return (
        <AccordionBlockEditor
          block={block as AccordionBlock}
          onChange={onChange as (next: AccordionBlock) => void}
        />
      );
    default:
      return null;
  }
}
