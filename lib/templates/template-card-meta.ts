import { iterateProposalContentBlocks } from "@/lib/proposal/blocks";
import {
  templateCatalogCategoryLabel,
  templateCatalogVersionLabel,
  type TemplateCatalogMeta,
} from "@/lib/templates/catalog-meta";
import type { TemplateHubKind } from "@/lib/templates/hub-rows";
import type { ProposalDocument } from "@/types/proposal";

const AUTHOR_NAMES = [
  "Sarah Chen",
  "Michael Rodriguez",
  "Alex Kim",
  "Jordan Lee",
] as const;

/** Card metadata for templates hub — catalog fields when set, placeholders otherwise. */
export interface TemplateCardMeta {
  /** e.g. "Mobile Development • SaaS" */
  categoryLabel: string;
  /** Placeholder until `createdByUid` is resolved to staff display name. */
  authorName: string;
  authorInitials: string;
  /** e.g. "27 times" */
  usageLabel: string;
  /** e.g. "8 sections • ~12 pages" — omitted when document empty */
  lengthLabel?: string;
  /** e.g. "v2.3" */
  versionLabel: string;
  featureTags: string[];
}

const PROPOSAL_USE_CASES = [
  "Mobile Development",
  "Web Design",
  "Consulting",
  "SaaS Onboarding",
  "Managed Services",
] as const;

const CONTRACT_USE_CASES = ["Legal", "Consulting", "Enterprise Sales", "HR & Compliance"] as const;

const PROPOSAL_SUBCATEGORIES = ["SaaS", "Mobile App Services", "Web Design", "Consulting"] as const;
const CONTRACT_SUBCATEGORIES = ["NDA", "MSA", "SOW", "Privacy Policy"] as const;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(items: readonly T[], seed: number): T {
  return items[seed % items.length]!;
}

function deriveFeatureTags(document?: ProposalDocument): string[] {
  if (!document?.blocks?.length) return [];

  const types = new Set<string>();
  for (const block of iterateProposalContentBlocks(document.blocks)) {
    types.add(block.type);
  }

  const tags: string[] = [];
  if (types.has("pricing") || types.has("packages")) tags.push("Dynamic Pricing");
  if (types.has("signature") || types.has("agreement")) tags.push("E-signature");
  if (types.has("payment")) tags.push("Payments");
  if (types.has("form")) tags.push("Intake Form");

  return tags;
}

function deriveLengthLabel(document?: ProposalDocument): string | undefined {
  const blocks = document?.blocks;
  if (!blocks?.length) return undefined;

  const sectionCount = blocks.filter((b) => b.type === "section").length;
  const topLevelCount = blocks.length;
  const sections = sectionCount > 0 ? sectionCount : topLevelCount;
  const pages = Math.max(1, Math.ceil(sections * 1.5));

  return `${sections} section${sections === 1 ? "" : "s"} • ~${pages} page${pages === 1 ? "" : "s"}`;
}

/** Builds card metadata — saved catalog fields plus document-derived length/tags fallbacks. */
export function buildTemplateCardMeta(
  id: string,
  kind: TemplateHubKind,
  document?: ProposalDocument,
  catalogMeta?: TemplateCatalogMeta,
): TemplateCardMeta {
  const seed = hashString(`${kind}:${id}`);
  const useCases = kind === "contract" ? CONTRACT_USE_CASES : PROPOSAL_USE_CASES;
  const subcategories = kind === "contract" ? CONTRACT_SUBCATEGORIES : PROPOSAL_SUBCATEGORIES;
  const useCase = pick(useCases, seed);
  const subcategory = pick(subcategories, seed >> 3);

  const usageCount = 8 + (seed % 42);
  const major = 1 + (seed % 3);
  const minor = seed % 10;
  const authorName = pick(AUTHOR_NAMES, seed >> 5);
  const authorInitials = authorName
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2);

  const savedCategory = templateCatalogCategoryLabel(catalogMeta);
  const savedVersion = templateCatalogVersionLabel(catalogMeta);
  const savedFeatures = catalogMeta?.keyFeatures?.filter((tag) => tag.trim().length > 0) ?? [];

  const derivedTags = deriveFeatureTags(document);
  const featureTags =
    savedFeatures.length > 0
      ? savedFeatures.slice(0, 4)
      : (() => {
          const tags = [...derivedTags];
          if (seed % 3 === 0 && !tags.includes("Popular")) tags.unshift("Popular");
          if (seed % 5 === 0 && !tags.includes("AI Ready")) tags.push("AI Ready");
          return tags.slice(0, 4);
        })();

  return {
    categoryLabel: savedCategory ?? `${useCase} • ${subcategory}`,
    authorName,
    authorInitials,
    usageLabel: `${usageCount} time${usageCount === 1 ? "" : "s"}`,
    lengthLabel: deriveLengthLabel(document),
    versionLabel: savedVersion ?? `v${major}.${minor}`,
    featureTags,
  };
}
