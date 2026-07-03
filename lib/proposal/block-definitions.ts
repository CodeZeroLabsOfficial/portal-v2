import { v4 as uuidv4 } from "uuid";

import { PROPOSAL_IMAGE_BLOCK_PLACEHOLDER_URL } from "@/lib/proposal/media/image-placeholder";
import { DEFAULT_HIGHLIGHT_COLOR, DEFAULT_PRIMARY_COLOR } from "@/lib/proposal/block-style";
import { defaultSplashBlock } from "@/lib/proposal/splash-block";
import type { ColumnsBlock, ProposalBlock } from "@/types/proposal";
import type { ColumnLayoutCount } from "@/lib/proposal/columns";

export { DEFAULT_PRIMARY_COLOR };
export const DEFAULT_PACKAGES_UPFRONT_COST_12_MINOR = 0;

export function newProposalBlockId(): string {
  return uuidv4();
}

export function createColumnsBlock(count: ColumnLayoutCount): ColumnsBlock {
  return {
    id: newProposalBlockId(),
    type: "columns",
    stacks: Array.from({ length: count }, () => []),
  };
}

/** Default block factory used by the builder insert menus and block registry. */
export function createProposalBlock(type: ProposalBlock["type"]): ProposalBlock {
  const id = newProposalBlockId();
  switch (type) {
    case "splash":
      return defaultSplashBlock(id);
    case "header":
      return {
        id,
        type: "header",
        text: "Section heading",
        html: "<h2>Section heading</h2>",
      };
    case "text":
      return { id, type: "text", html: "<p></p>" };
    case "image":
      return { id, type: "image", url: PROPOSAL_IMAGE_BLOCK_PLACEHOLDER_URL, alt: "" };
    case "video":
      return { id, type: "video", url: "" };
    case "pricing":
      return {
        id,
        type: "pricing",
        currency: "aud",
        title: "Investment",
        allowQuantityEdit: true,
        lineItems: [{ id: newProposalBlockId(), label: "Service package", unitAmountMinor: 100_000, quantity: 1 }],
      };
    case "packages": {
      const t1 = newProposalBlockId();
      const t2 = newProposalBlockId();
      const t3 = newProposalBlockId();
      const t4 = newProposalBlockId();
      return {
        id,
        type: "packages",
        currency: "aud",
        title: "Packages",
        plan12Label: "12 months",
        plan24Label: "24 months",
        style: {
          variant: "visual",
          primaryColor: DEFAULT_PRIMARY_COLOR,
          highlightColor: DEFAULT_HIGHLIGHT_COLOR,
        },
        tiers: [
          {
            id: t1,
            name: "Starter",
            includedUsers: 3,
            includedLocations: 1,
            includedAdmins: 1,
            monthlyCost12Minor: 49_900,
            monthlyCost24Minor: 29_900,
            upfrontCost12Minor: DEFAULT_PACKAGES_UPFRONT_COST_12_MINOR,
            features: [],
          },
          {
            id: t2,
            name: "Professional",
            includedUsers: 5,
            includedLocations: 1,
            includedAdmins: 1,
            monthlyCost12Minor: 59_900,
            monthlyCost24Minor: 37_900,
            upfrontCost12Minor: DEFAULT_PACKAGES_UPFRONT_COST_12_MINOR,
            recommended: true,
            features: [],
          },
          {
            id: t3,
            name: "Premium",
            includedUsers: 10,
            includedLocations: 1,
            includedAdmins: 1,
            monthlyCost12Minor: 69_900,
            monthlyCost24Minor: 49_900,
            upfrontCost12Minor: DEFAULT_PACKAGES_UPFRONT_COST_12_MINOR,
            features: [],
          },
          {
            id: t4,
            name: "Enterprise",
            includedUsers: 0,
            includedLocations: 0,
            includedAdmins: 0,
            monthlyCost12Minor: 149_900,
            monthlyCost24Minor: 99_900,
            upfrontCost12Minor: DEFAULT_PACKAGES_UPFRONT_COST_12_MINOR,
            features: [],
          },
        ],
        addonsSectionEnabled: false,
      };
    }
    case "form":
      return {
        id,
        type: "form",
        submitLabel: "Your details",
        fields: [{ id: newProposalBlockId(), label: "Anything we should know?", fieldType: "textarea", required: false }],
      };
    case "signature":
      return {
        id,
        type: "signature",
        title: "Agreement",
        signerLabel: "Authorized signatory",
        requirePrintedName: true,
        requireAcceptTerms: true,
        termsSummary: "By accepting, you agree to the scope and pricing described above.",
      };
    case "agreement":
      return {
        id,
        type: "agreement",
        children: [],
        buttonLabel: "View Agreement",
        requireAcceptTerms: true,
      };
    case "embed":
      return { id, type: "embed", url: "", title: "Embedded content" };
    case "payment":
      return { id, type: "payment", label: "Secure payment" };
    case "divider":
      return { id, type: "divider" };
    case "spacer":
      return { id, type: "spacer", heightPx: 40 };
    case "accordion":
      return {
        id,
        type: "accordion",
        panels: [{ id: newProposalBlockId(), title: "Question", html: "<p></p>" }],
      };
    case "columns":
      return createColumnsBlock(2);
    case "icon":
      return { id, type: "icon", iconName: "Sparkles", label: "" };
    case "section":
      return {
        id,
        type: "section",
        children: [],
        style: {
          variant: "simple",
          primaryColor: DEFAULT_PRIMARY_COLOR,
          highlightColor: DEFAULT_HIGHLIGHT_COLOR,
        },
      };
    default:
      return { id, type: "text", html: "<p></p>" };
  }
}
