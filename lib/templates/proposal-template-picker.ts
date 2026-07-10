import { buildTemplateCardMeta, type TemplateCardMeta } from "@/lib/templates/template-card-meta";
import { resolveTemplateCoverImageUrl } from "@/lib/templates/template-cover-url";
import { resolveTemplateCoverPreviewBlocks } from "@/lib/templates/template-cover-preview";
import type { ProposalBlock, ProposalBranding } from "@/types/proposal";
import type { ProposalTemplateRecord } from "@/types/proposal-template";

/** Row shape for the CRM proposal template picker (modal grid). */
export interface ProposalTemplatePickerRow {
  id: string;
  name: string;
  description?: string;
  coverPreviewBlocks?: ProposalBlock[];
  branding?: ProposalBranding;
  coverImageUrl?: string;
  cardMeta: TemplateCardMeta;
}

export function proposalTemplateRecordToPickerRow(
  record: ProposalTemplateRecord,
): ProposalTemplatePickerRow {
  return {
    id: record.id,
    name: record.name,
    description: record.description?.trim() || undefined,
    coverPreviewBlocks: resolveTemplateCoverPreviewBlocks(record.document),
    branding: record.branding,
    coverImageUrl: resolveTemplateCoverImageUrl(record.document),
    cardMeta: buildTemplateCardMeta(record.id, "proposal", record.document, record.catalogMeta),
  };
}

function pickerExcerpt(row: ProposalTemplatePickerRow): string {
  return row.description?.trim() || row.cardMeta.subtitleLabel?.trim() || "No description";
}

/** Published proposal templates for the CRM picker (no drafts, no contract-type rows). */
export function filterProposalTemplatesForPicker(
  records: ProposalTemplateRecord[],
): ProposalTemplateRecord[] {
  return records.filter((t) => t.stage === "published" && t.templateType !== "contract");
}

/** Sorts picker rows by template title (A–Z, case-insensitive). */
export function sortProposalTemplatePickerRows(
  rows: ProposalTemplatePickerRow[],
): ProposalTemplatePickerRow[] {
  return [...rows].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export function proposalTemplatePickerExcerpt(row: ProposalTemplatePickerRow): string {
  return pickerExcerpt(row);
}
