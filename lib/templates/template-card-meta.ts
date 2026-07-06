import { iterateProposalContentBlocks } from "@/lib/proposal/blocks";
import {
  type TemplateCatalogMeta,
} from "@/lib/templates/catalog-meta";
import type { TemplateHubKind } from "@/lib/templates/hub-rows";
import type { ProposalDocument } from "@/types/proposal";

/** Card metadata for templates hub — catalog fields when set, document-derived tag fallbacks otherwise. */
export interface TemplateCardMeta {
  /** From Properties subtitle — shown under the card title when set. */
  subtitleLabel?: string;
  featureTags: string[];
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
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

/** Builds card metadata — saved catalog fields plus document-derived tag fallbacks. */
export function buildTemplateCardMeta(
  id: string,
  kind: TemplateHubKind,
  document?: ProposalDocument,
  catalogMeta?: TemplateCatalogMeta,
): TemplateCardMeta {
  const seed = hashString(`${kind}:${id}`);

  const savedFeatures = catalogMeta?.keyFeatures?.filter((tag) => tag.trim().length > 0) ?? [];
  const subtitleLabel = catalogMeta?.subtitle?.trim() || undefined;

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
    subtitleLabel,
    featureTags,
  };
}
