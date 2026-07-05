import { resolveTemplateCoverImageUrl } from "@/lib/templates/template-cover-url";
import type { ContractTemplateRecord } from "@/types/contract-template";
import type { ProposalTemplateRecord, ProposalTemplateStage } from "@/types/proposal-template";

export type TemplateHubKind = "proposal" | "contract";

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

/** Merges proposal and contract templates into one sorted list for the hub grid. */
export function buildTemplateHubRows(
  proposalTemplates: ProposalTemplateRecord[],
  contractTemplates: ContractTemplateRecord[]
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
    editHref: `/admin/templates/contracts/${row.id}`,
    previewHref: `/admin/templates/contracts/${row.id}/preview`,
  }));

  return [...proposalRows, ...contractRows].sort((a, b) => b.lastEditedMs - a.lastEditedMs);
}
