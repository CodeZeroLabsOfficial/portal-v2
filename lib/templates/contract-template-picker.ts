import { contractTemplateToAgreementSnapshot } from "@/lib/contract-template/agreement-snapshot";
import { buildTemplateCardMeta, type TemplateCardMeta } from "@/lib/templates/template-card-meta";
import type { ContractTemplateRecord } from "@/types/contract-template";
import type { ProposalTemplateStage } from "@/types/proposal-template";

/** Snapshot applied to an Accept block when a template is chosen in the picker. */
export interface ContractTemplatePick {
  id: string;
  name: string;
  agreementTitle: string;
  introHtml: string;
  legalHtml: string;
}

/** Row shape for the Accept-block contract template picker (modal grid). */
export interface ContractTemplatePickerRow {
  id: string;
  name: string;
  agreementTitle: string;
  introHtml: string;
  legalHtml: string;
  description?: string;
  cardMeta: TemplateCardMeta;
  stage: ProposalTemplateStage;
}

export function contractTemplateRecordToPickerRow(record: ContractTemplateRecord): ContractTemplatePickerRow {
  const snapshot = contractTemplateToAgreementSnapshot(record);
  return {
    id: record.id,
    name: record.name,
    agreementTitle: snapshot.agreementTitle,
    introHtml: snapshot.introHtml ?? "",
    legalHtml: snapshot.legalHtml ?? "",
    description: record.description?.trim() || undefined,
    cardMeta: buildTemplateCardMeta(record.id, "contract", record.document, record.catalogMeta),
    stage: record.stage,
  };
}

function pickerExcerpt(row: ContractTemplatePickerRow): string {
  return row.description?.trim() || row.agreementTitle?.trim() || "No description";
}

/** Published templates for the picker, optionally including one draft by id (current block attachment). */
export function filterContractTemplatesForPicker(
  records: ContractTemplateRecord[],
  includeId?: string,
): ContractTemplateRecord[] {
  const published = records.filter((t) => t.stage === "published");
  const include = includeId?.trim();
  if (!include) return published;
  if (published.some((t) => t.id === include)) return published;
  const extra = records.find((t) => t.id === include && t.stage === "draft");
  return extra ? [...published, extra] : published;
}

/** Client-side search for picker rows (name, subtitle, description, agreement title, tags). */
export function filterContractTemplatePickerRows(
  rows: ContractTemplatePickerRow[],
  searchQuery: string,
): ContractTemplatePickerRow[] {
  const q = searchQuery.trim().toLowerCase();
  if (!q) {
    return [...rows].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }

  return rows
    .filter((row) => {
      const hay = [
        row.name,
        row.description ?? "",
        row.agreementTitle,
        row.cardMeta.subtitleLabel ?? "",
        ...row.cardMeta.featureTags,
        pickerExcerpt(row),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export function contractTemplatePickerExcerpt(row: ContractTemplatePickerRow): string {
  return pickerExcerpt(row);
}
