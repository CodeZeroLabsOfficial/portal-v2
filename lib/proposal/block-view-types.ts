import type * as React from "react";
import type { CatalogServicePickerOption } from "@/types/catalog-service";
import type {
  ProposalBlock,
  ProposalContentBlock,
  ProposalPublicSelections,
  ProposalStatus,
} from "@/types/proposal";
import type { ProposalPublicSubscriptionUi } from "@/server/proposal/public-proposal-subscription-ui";

export interface ProposalRenderContext {
  allBlocks: ProposalBlock[];
  brandingLogoUrl?: string;
  firstRootSplashBlockId?: string | null;
  proposalStatus?: ProposalStatus;
  acceptedByName?: string;
  acceptedSignatureDataUrl?: string;
  acceptedAt?: number;
  localityTimeZone?: string;
  publicSubscriptionUi?: ProposalPublicSubscriptionUi | null;
  customerSignerPrefill?: import("@/types/proposal").ProposalCustomerSignerPrefill | null;
  catalogServices?: readonly CatalogServicePickerOption[];
  stripePublishableKey?: string;
}

export interface ProposalBlockViewProps {
  block: ProposalBlock | ProposalContentBlock;
  shareToken?: string;
  publicSelections?: ProposalPublicSelections;
  viewportSectionBleed?: boolean;
  splashPublicPresentation?: "editor" | "nestedColumn" | "rootFullWidth";
  proposalContext?: ProposalRenderContext;
  renderBlock: (block: ProposalBlock | ProposalContentBlock) => React.ReactNode;
}

export type ProposalBlockViewRenderer = (props: ProposalBlockViewProps) => React.ReactNode;
