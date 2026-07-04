"use client";

import * as React from "react";
import { Clock } from "lucide-react";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { CrmActivityPanelShell } from "@/components/shared/crm-activity-panel-shell";
import { CrmActivityTimelineItem } from "@/components/shared/crm-activity-timeline-item";
import { opportunityActivityIcon } from "@/lib/crm/opportunity-activity-display";
import type { OpportunityActivityRecord } from "@/types/opportunity";

export interface OpportunityActivitiesPanelProps {
  customerId: string;
  activities: OpportunityActivityRecord[];
}

export function OpportunityActivitiesPanel({ customerId, activities }: OpportunityActivitiesPanelProps) {
  const timeline = React.useMemo(
    () => [...activities].sort((a, b) => b.createdAt - a.createdAt),
    [activities]
  );

  return (
    <CrmActivityPanelShell title="Latest Activity">
      {timeline.length === 0 ? (
        <CustomerTabEmptyState icon={Clock} embedded>
          <p>No activity yet</p>
          <p>Stage changes, proposals, and other system events will show up here.</p>
        </CustomerTabEmptyState>
      ) : (
        <ol className="relative border-s ps-8">
          {timeline.map((activity, index) => {
            const proposalHref =
              activity.type === "proposal_created" && activity.proposalId?.trim()
                ? `/admin/proposals/${activity.proposalId}?customer=${encodeURIComponent(customerId)}`
                : null;

            return (
              <CrmActivityTimelineItem
                key={activity.id}
                title={activity.title}
                createdAt={activity.createdAt}
                icon={opportunityActivityIcon(activity.type)}
                isLatest={index === 0}
                isLast={index === timeline.length - 1}
                proposalHref={proposalHref}
                proposalTitle={activity.detail}
                detail={proposalHref ? undefined : activity.detail}
                typeSlug={proposalHref ? undefined : activity.type}
              />
            );
          })}
        </ol>
      )}
    </CrmActivityPanelShell>
  );
}
