import type * as React from "react";
import type { CatalogServicePickerOption } from "@/types/catalog-service";
import type {
  ProposalBlock,
  ProposalContentBlock,
  ProposalPublicSelections,
  ProposalStatus,
} from "@/types/proposal";
import type { ProposalPublicSubscriptionUi } from "@/server/proposal/public-proposal-subscription-ui";
import type { SignedAgreementRecord } from "@/types/signed-agreement";

export interface SignedAgreementContext {
  record: SignedAgreementRecord;
  signatureSrc: string | null;
}

export interface ProposalRenderContext {
  allBlocks: ProposalBlock[];
  brandingLogoUrl?: string;
  firstRootSplashBlockId?: string | null;
  proposalStatus?: ProposalStatus;
  acceptedByName?: string;
  acceptedSignerOrganization?: string;
  acceptedSignatureDataUrl?: string;
  acceptedAt?: number;
  localityTimeZone?: string;
  publicSubscriptionUi?: ProposalPublicSubscriptionUi | null;
  customerSignerPrefill?: import("@/types/proposal").ProposalCustomerSignerPrefill | null;
  catalogServices?: readonly CatalogServicePickerOption[];
  stripePublishableKey?: string;
  companyPrintName?: string;
  /** signedAgreements row — post-sign agreement modal reads this instead of live block copy. */
  signedAgreement?: SignedAgreementContext | null;
}

export interface ProposalBlockViewProps {
  block: ProposalBlock | ProposalContentBlock;
  shareToken?: string;
  publicSelections?: ProposalPublicSelections;
  viewportSectionBleed?: boolean;
  splashPublicPresentation?: "editor" | "nestedColumn" | "rootFullWidth";
  proposalContext?: ProposalRenderContext;
  renderBlock: (block: ProposalBlock | ProposalContentBlock) => React.ReactNode;
  /** Root document view: alternate inner padding for the first section when `flushTop` is set. */
  sectionInnerPadClasses?: string;
}

export type ProposalBlockViewRenderer = (props: ProposalBlockViewProps) => React.ReactNode;
