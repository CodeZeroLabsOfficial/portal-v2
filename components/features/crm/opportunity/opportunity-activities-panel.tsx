"use client";

import * as React from "react";
import { Clock } from "lucide-react";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { AddOpportunityActivityDialog } from "@/components/features/crm/opportunity/add-opportunity-activity-dialog";
import { CrmActivityPanelShell } from "@/components/shared/crm-activity-panel-shell";
import { Badge } from "@/components/ui/badge";
import { opportunityActivityKindMeta } from "@/lib/crm/opportunity-activity-display";
import type { OpportunityActivityRecord } from "@/types/opportunity";

export interface OpportunityActivitiesPanelProps {
  opportunityId: string;
  activities: OpportunityActivityRecord[];
}

export function OpportunityActivitiesPanel({
  opportunityId,
  activities
}: OpportunityActivitiesPanelProps) {
  const timeline = React.useMemo(
    () => [...activities].sort((a, b) => b.occurredAt - a.occurredAt),
    [activities]
  );

  return (
    <CrmActivityPanelShell
      title="Latest Activity"
      action={<AddOpportunityActivityDialog opportunityId={opportunityId} />}>
      {timeline.length === 0 ? (
        <CustomerTabEmptyState icon={Clock} embedded>
          <p>No activity yet</p>
          <p>Log meetings, calls, and emails using the button above.</p>
        </CustomerTabEmptyState>
      ) : (
        <ol className="relative border-s ps-8">
          {timeline.map((activity, index) => {
            const meta = opportunityActivityKindMeta(activity.kind);
            const Icon = meta.icon;
            const isLast = index === timeline.length - 1;
            return (
              <li key={activity.id} className={`ms-6 space-y-2 ${isLast ? "" : "mb-10"}`}>
                <span className="bg-muted absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full border">
                  <Icon className="text-primary size-3" aria-hidden />
                </span>
                <h3 className="flex flex-wrap items-center font-semibold">
                  {activity.title}
                  <Badge variant="outline" className="ms-2 gap-1.5 font-normal">
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {meta.label}
                  </Badge>
                </h3>
                <time
                  dateTime={new Date(activity.occurredAt).toISOString()}
                  className="text-muted-foreground flex items-center gap-1.5 text-sm leading-none">
                  <Clock className="size-3" aria-hidden />
                  {new Date(activity.occurredAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                </time>
                {activity.detail ? (
                  <p className="text-muted-foreground text-sm">{activity.detail}</p>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </CrmActivityPanelShell>
  );
}
