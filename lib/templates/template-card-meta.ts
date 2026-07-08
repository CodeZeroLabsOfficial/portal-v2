import type { TemplateCatalogMeta } from "@/lib/templates/catalog-meta";
import type { TemplateHubKind } from "@/lib/templates/hub-rows";
import type { ProposalDocument } from "@/types/proposal";

/** Card metadata for templates hub — catalog fields when set on the template. */
export interface TemplateCardMeta {
  /** From Properties subtitle — shown under the card title when set. */
  subtitleLabel?: string;
  featureTags: string[];
}

/** Builds card metadata from saved catalog fields on the template record. */
export function buildTemplateCardMeta(
  _id: string,
  _kind: TemplateHubKind,
  _document?: ProposalDocument,
  catalogMeta?: TemplateCatalogMeta,
): TemplateCardMeta {
  const featureTags =
    catalogMeta?.keyFeatures?.filter((tag) => tag.trim().length > 0).slice(0, 4) ?? [];
  const subtitleLabel = catalogMeta?.subtitle?.trim() || undefined;

  return {
    subtitleLabel,
    featureTags,
  };
}
