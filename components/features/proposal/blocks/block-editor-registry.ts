import type { ComponentType } from "react";

import { TextBlockEditor } from "@/components/features/proposal/blocks/text/editor";
import { HeaderBlockEditor } from "@/components/features/proposal/blocks/header/editor";
import { DividerBlockEditor } from "@/components/features/proposal/blocks/divider/editor";
import { SpacerBlockEditor } from "@/components/features/proposal/blocks/spacer/editor";
import { ImageBlockEditor } from "@/components/features/proposal/blocks/image/editor";
import { VideoBlockEditor } from "@/components/features/proposal/blocks/video/editor";
import { IconBlockEditor } from "@/components/features/proposal/blocks/icon/editor";
import { EmbedBlockEditor } from "@/components/features/proposal/blocks/embed/editor";
import { FormBlockEditor } from "@/components/features/proposal/blocks/form/editor";
import { PaymentBlockEditor } from "@/components/features/proposal/blocks/payment/editor";
import { SignatureBlockEditor } from "@/components/features/proposal/blocks/signature/editor";
import { SplashBlockEditor } from "@/components/features/proposal/blocks/splash/editor";
import { AccordionBlockEditor } from "@/components/features/proposal/blocks/accordion/editor";
import { ColumnsBlockEditor } from "@/components/features/proposal/blocks/columns/editor";
import { SectionBlockEditor } from "@/components/features/proposal/blocks/section/editor";
import { AgreementBlockEditor } from "@/components/features/proposal/blocks/agreement/editor";
import { PricingBlockEditor } from "@/components/features/proposal/blocks/pricing/editor";
import { PackagesBlockEditor } from "@/components/features/proposal/blocks/packages/editor";
import { createProposalBlock } from "@/lib/proposal/block-definitions";
import type { ProposalBlock } from "@/types/proposal";

export type BlockMenuProfile = "proposal" | "template" | "contract-template";

export interface BlockEditorProps<T extends ProposalBlock = ProposalBlock> {
  block: T;
  onChange: (block: T) => void;
  selected?: boolean;
}

export interface BlockViewerProps {
  block: ProposalBlock;
}

export interface ProposalBlockDefinition {
  type: ProposalBlock["type"];
  label: string;
  createDefault: () => ProposalBlock;
  allowedProfiles: BlockMenuProfile[];
  allowedParents: ("root" | "section" | "column" | "agreement")[];
  Editor?: ComponentType<BlockEditorProps<ProposalBlock>>;
  Viewer?: ComponentType<BlockViewerProps>;
}

function defineBlock(def: ProposalBlockDefinition): ProposalBlockDefinition {
  return def;
}

export const TEXT_BLOCK_DEFINITION = defineBlock({
  type: "text",
  label: "Text",
  createDefault: () => createProposalBlock("text"),
  allowedProfiles: ["proposal", "template", "contract-template"],
  allowedParents: ["section", "column", "agreement"],
  Editor: TextBlockEditor as ProposalBlockDefinition["Editor"],
});

export const HEADER_BLOCK_DEFINITION = defineBlock({
  type: "header",
  label: "Heading",
  createDefault: () => createProposalBlock("header") as Extract<ProposalBlock, { type: "header" }>,
  allowedProfiles: ["proposal", "template", "contract-template"],
  allowedParents: ["section", "column", "agreement"],
  Editor: HeaderBlockEditor as ProposalBlockDefinition["Editor"],
});

export const DIVIDER_BLOCK_DEFINITION = defineBlock({
  type: "divider",
  label: "Divider",
  createDefault: () => createProposalBlock("divider") as Extract<ProposalBlock, { type: "divider" }>,
  allowedProfiles: ["proposal", "template", "contract-template"],
  allowedParents: ["section", "column", "agreement"],
  Editor: DividerBlockEditor as ProposalBlockDefinition["Editor"],
});

export const SPACER_BLOCK_DEFINITION = defineBlock({
  type: "spacer",
  label: "Spacer",
  createDefault: () => createProposalBlock("spacer") as Extract<ProposalBlock, { type: "spacer" }>,
  allowedProfiles: ["proposal", "template", "contract-template"],
  allowedParents: ["section", "column", "agreement"],
  Editor: SpacerBlockEditor as ProposalBlockDefinition["Editor"],
});

export const SPLASH_BLOCK_DEFINITION = defineBlock({
  type: "splash",
  label: "Splash",
  createDefault: () => createProposalBlock("splash") as Extract<ProposalBlock, { type: "splash" }>,
  allowedProfiles: ["proposal", "template"],
  allowedParents: ["root", "section", "column"],
  Editor: SplashBlockEditor as ProposalBlockDefinition["Editor"],
});

export const IMAGE_BLOCK_DEFINITION = defineBlock({
  type: "image",
  label: "Image",
  createDefault: () => createProposalBlock("image") as Extract<ProposalBlock, { type: "image" }>,
  allowedProfiles: ["proposal", "template", "contract-template"],
  allowedParents: ["section", "column", "agreement"],
  Editor: ImageBlockEditor as ProposalBlockDefinition["Editor"],
});

export const VIDEO_BLOCK_DEFINITION = defineBlock({
  type: "video",
  label: "Video",
  createDefault: () => createProposalBlock("video") as Extract<ProposalBlock, { type: "video" }>,
  allowedProfiles: ["proposal", "template"],
  allowedParents: ["section", "column", "agreement"],
  Editor: VideoBlockEditor as ProposalBlockDefinition["Editor"],
});

export const ICON_BLOCK_DEFINITION = defineBlock({
  type: "icon",
  label: "Icon",
  createDefault: () => createProposalBlock("icon") as Extract<ProposalBlock, { type: "icon" }>,
  allowedProfiles: ["proposal", "template"],
  allowedParents: ["section", "column"],
  Editor: IconBlockEditor as ProposalBlockDefinition["Editor"],
});

export const SECTION_BLOCK_DEFINITION = defineBlock({
  type: "section",
  label: "Section",
  createDefault: () => createProposalBlock("section") as Extract<ProposalBlock, { type: "section" }>,
  allowedProfiles: ["proposal", "template", "contract-template"],
  allowedParents: ["root"],
  Editor: SectionBlockEditor as ProposalBlockDefinition["Editor"],
});

export const COLUMNS_BLOCK_DEFINITION = defineBlock({
  type: "columns",
  label: "Columns",
  createDefault: () => createProposalBlock("columns") as Extract<ProposalBlock, { type: "columns" }>,
  allowedProfiles: ["proposal", "template", "contract-template"],
  allowedParents: ["root", "section", "agreement"],
  Editor: ColumnsBlockEditor as ProposalBlockDefinition["Editor"],
});

export const ACCORDION_BLOCK_DEFINITION = defineBlock({
  type: "accordion",
  label: "Accordion",
  createDefault: () => createProposalBlock("accordion") as Extract<ProposalBlock, { type: "accordion" }>,
  allowedProfiles: ["proposal", "template", "contract-template"],
  allowedParents: ["root", "section", "column"],
  Editor: AccordionBlockEditor as ProposalBlockDefinition["Editor"],
});

export const PACKAGES_BLOCK_DEFINITION = defineBlock({
  type: "packages",
  label: "Plans",
  createDefault: () => createProposalBlock("packages") as Extract<ProposalBlock, { type: "packages" }>,
  allowedProfiles: ["proposal", "template"],
  allowedParents: ["section", "column", "agreement"],
  Editor: PackagesBlockEditor as ProposalBlockDefinition["Editor"],
});

export const PRICING_BLOCK_DEFINITION = defineBlock({
  type: "pricing",
  label: "Pricing",
  createDefault: () => createProposalBlock("pricing") as Extract<ProposalBlock, { type: "pricing" }>,
  allowedProfiles: ["proposal", "template"],
  allowedParents: ["section", "column", "agreement"],
  Editor: PricingBlockEditor as ProposalBlockDefinition["Editor"],
});

export const AGREEMENT_BLOCK_DEFINITION = defineBlock({
  type: "agreement",
  label: "Accept",
  createDefault: () => createProposalBlock("agreement") as Extract<ProposalBlock, { type: "agreement" }>,
  allowedProfiles: ["proposal", "template"],
  allowedParents: ["root", "column"],
  Editor: AgreementBlockEditor as ProposalBlockDefinition["Editor"],
});

export const FORM_BLOCK_DEFINITION = defineBlock({
  type: "form",
  label: "Form",
  createDefault: () => createProposalBlock("form") as Extract<ProposalBlock, { type: "form" }>,
  allowedProfiles: ["proposal"],
  allowedParents: ["section", "column"],
  Editor: FormBlockEditor as ProposalBlockDefinition["Editor"],
});

export const SIGNATURE_BLOCK_DEFINITION = defineBlock({
  type: "signature",
  label: "Signature",
  createDefault: () => createProposalBlock("signature") as Extract<ProposalBlock, { type: "signature" }>,
  allowedProfiles: ["proposal"],
  allowedParents: ["section", "column", "agreement"],
  Editor: SignatureBlockEditor as ProposalBlockDefinition["Editor"],
});

export const PAYMENT_BLOCK_DEFINITION = defineBlock({
  type: "payment",
  label: "Payment",
  createDefault: () => createProposalBlock("payment") as Extract<ProposalBlock, { type: "payment" }>,
  allowedProfiles: ["proposal"],
  allowedParents: ["section", "column"],
  Editor: PaymentBlockEditor as ProposalBlockDefinition["Editor"],
});

export const EMBED_BLOCK_DEFINITION = defineBlock({
  type: "embed",
  label: "Embed",
  createDefault: () => createProposalBlock("embed") as Extract<ProposalBlock, { type: "embed" }>,
  allowedProfiles: ["proposal", "template"],
  allowedParents: ["section", "column"],
  Editor: EmbedBlockEditor as ProposalBlockDefinition["Editor"],
});

export const PROPOSAL_BLOCK_DEFINITIONS = [
  TEXT_BLOCK_DEFINITION,
  HEADER_BLOCK_DEFINITION,
  DIVIDER_BLOCK_DEFINITION,
  SPACER_BLOCK_DEFINITION,
  SPLASH_BLOCK_DEFINITION,
  IMAGE_BLOCK_DEFINITION,
  VIDEO_BLOCK_DEFINITION,
  ICON_BLOCK_DEFINITION,
  SECTION_BLOCK_DEFINITION,
  COLUMNS_BLOCK_DEFINITION,
  ACCORDION_BLOCK_DEFINITION,
  PACKAGES_BLOCK_DEFINITION,
  PRICING_BLOCK_DEFINITION,
  AGREEMENT_BLOCK_DEFINITION,
  FORM_BLOCK_DEFINITION,
  SIGNATURE_BLOCK_DEFINITION,
  PAYMENT_BLOCK_DEFINITION,
  EMBED_BLOCK_DEFINITION,
] as const;

export type RegisteredBlockType = ProposalBlock["type"];

const REGISTRY_BY_TYPE: Partial<Record<RegisteredBlockType, ProposalBlockDefinition>> = Object.fromEntries(
  PROPOSAL_BLOCK_DEFINITIONS.map((def) => [def.type, def]),
);

export function getBlockDefinition(type: ProposalBlock["type"]): ProposalBlockDefinition | undefined {
  return REGISTRY_BY_TYPE[type];
}

export function listBlocksForProfile(
  profile: BlockMenuProfile,
  parent: "root" | "section" | "column" | "agreement" = "root",
): ProposalBlockDefinition[] {
  return PROPOSAL_BLOCK_DEFINITIONS.filter(
    (def) => def.allowedProfiles.includes(profile) && def.allowedParents.includes(parent),
  );
}

export { createProposalBlock };
