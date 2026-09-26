import type { StatusBadgeDisplay } from "@/lib/crm/status-badges";
import type { TemplateHubKind } from "@/lib/templates/hub-rows";
import type { ProposalTemplateStage } from "@/types/proposal-template";

export function templateKindLabel(kind: TemplateHubKind): string {
  return kind === "contract" ? "Contract" : "Proposal";
}

export function templateStatusBadgeDisplay(stage: ProposalTemplateStage): StatusBadgeDisplay {
  if (stage === "published") {
    return { label: "Published", variant: "success", dot: true };
  }
  return { label: "Draft", variant: "amber", dot: true };
}

export function templateStatusBadgeTitle(stage: ProposalTemplateStage): string {
  if (stage === "published") {
    return "Marked ready for CRM and customer proposals.";
  }
  return "Still in progress — publish when the template is ready to use.";
}
