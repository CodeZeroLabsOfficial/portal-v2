import type { StatusBadgeDisplay } from "@/lib/crm/status-badges";
import type { ProposalTemplateStage } from "@/types/proposal-template";

export function templateStageBadgeDisplay(stage: ProposalTemplateStage): StatusBadgeDisplay {
  if (stage === "published") {
    return { label: "Published", variant: "info" };
  }
  return { label: "Draft", variant: "warning" };
}

export function templateStageBadgeTitle(stage: ProposalTemplateStage): string {
  if (stage === "published") {
    return "Marked ready for CRM and customer proposals.";
  }
  return "Still in progress — publish when the template is ready to use.";
}

export function templateTypeBadgeDisplay(typeLabel: "proposal" | "contract"): StatusBadgeDisplay {
  if (typeLabel === "contract") {
    return { label: "Contract", variant: "secondary" };
  }
  return { label: "Proposal", variant: "secondary" };
}
