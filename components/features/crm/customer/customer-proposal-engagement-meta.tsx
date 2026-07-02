import { Clock, Eye } from "lucide-react";

import { proposalEngagementLabel, proposalViewsLabel } from "@/lib/crm/customer-tab-labels";
import type { ProposalRecord } from "@/types/proposal";

export interface CustomerProposalEngagementMetaProps {
  proposal: ProposalRecord;
}

export function CustomerProposalEngagementMeta({ proposal }: CustomerProposalEngagementMetaProps) {
  return (
    <div className="text-muted-foreground flex shrink-0 items-center gap-x-4 text-xs">
      <span className="inline-flex items-center gap-1.5">
        <Eye className="size-3.5 shrink-0" aria-hidden />
        <span className="text-foreground/90">{proposalViewsLabel(proposal.viewCount)}</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-3.5 shrink-0" aria-hidden />
        <span className="text-foreground/90">
          {proposalEngagementLabel(proposal.totalEngagementSeconds)}
        </span>
      </span>
    </div>
  );
}
