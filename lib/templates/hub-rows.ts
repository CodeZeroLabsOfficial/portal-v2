import { resolveTemplateCoverImageUrl } from "@/lib/templates/template-cover-url";
import { buildTemplateCardMeta, type TemplateCardMeta } from "@/lib/templates/template-card-meta";
import type { ContractTemplateRecord } from "@/types/contract-template";
import type { ProposalTemplateRecord, ProposalTemplateStage } from "@/types/proposal-template";

export type TemplateHubKind = "proposal" | "contract";

export type TemplateHubTab = "all" | TemplateHubKind;

export const TEMPLATE_HUB_TABS = [
  { id: "all", label: "All" },
  { id: "proposal", label: "Proposals" },
  { id: "contract", label: "Contracts" },
] as const satisfies ReadonlyArray<{ id: TemplateHubTab; label: string }>;

/** Unified row for the templates hub card grid (proposal + contract templates). */
export interface TemplateHubRow {
  key: string;
  kind: TemplateHubKind;
  id: string;
  name: string;
  description?: string;
  stage: ProposalTemplateStage;
  lastEditedMs: number;
  agreementTitle?: string;
  coverImageUrl?: string;
  cardMeta: TemplateCardMeta;
  editHref: string;
  previewHref: string;
}

function lastEditedMsProposal(template: ProposalTemplateRecord): number {
  return (typeof template.updatedAt === "number" && template.updatedAt > 0
    ? template.updatedAt
    : template.createdAt) || 0;
}

function lastEditedMsContract(template: ContractTemplateRecord): number {
  return Math.max(template.updatedAt ?? 0, template.createdAt ?? 0);
}

/** Sorts hub rows by template title (A–Z, case-insensitive). */
export function compareTemplateHubRowsByTitle(a: TemplateHubRow, b: TemplateHubRow): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

/** Merges proposal and contract templates into one sorted list for the hub grid. */
export function buildTemplateHubRows(
  proposalTemplates: ProposalTemplateRecord[],
  contractTemplates: ContractTemplateRecord[],
): TemplateHubRow[] {
  const proposalRows: TemplateHubRow[] = proposalTemplates.map((row) => ({
    key: `proposal:${row.id}`,
    kind: "proposal",
    id: row.id,
    name: row.name,
    description: row.description,
    stage: row.stage,
    lastEditedMs: lastEditedMsProposal(row),
    coverImageUrl: resolveTemplateCoverImageUrl(row.document),
    cardMeta: buildTemplateCardMeta(row.id, "proposal", row.document, row.catalogMeta),
    editHref: `/admin/templates/${row.id}`,
    previewHref: `/admin/templates/${row.id}/preview`,
  }));

  const contractRows: TemplateHubRow[] = contractTemplates.map((row) => ({
    key: `contract:${row.id}`,
    kind: "contract",
    id: row.id,
    name: row.name,
    description: row.description,
    stage: row.stage,
    lastEditedMs: lastEditedMsContract(row),
    agreementTitle: row.agreementTitle,
    coverImageUrl: resolveTemplateCoverImageUrl(row.document),
    cardMeta: buildTemplateCardMeta(row.id, "contract", row.document, row.catalogMeta),
    editHref: `/admin/templates/contracts/${row.id}`,
    previewHref: `/admin/templates/contracts/${row.id}/preview`,
  }));

  return [...proposalRows, ...contractRows];
}
