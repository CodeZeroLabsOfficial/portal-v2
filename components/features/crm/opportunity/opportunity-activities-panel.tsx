"use client";

import * as React from "react";
import { Clock } from "lucide-react";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { CrmActivityPanelShell } from "@/components/shared/crm-activity-panel-shell";
import { Badge } from "@/components/ui/badge";
import { opportunityActivityIcon } from "@/lib/crm/opportunity-activity-display";
import type { OpportunityActivityRecord } from "@/types/opportunity";

export interface OpportunityActivitiesPanelProps {
  activities: OpportunityActivityRecord[];
}

export function OpportunityActivitiesPanel({ activities }: OpportunityActivitiesPanelProps) {
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
            const Icon = opportunityActivityIcon(activity.type);
            const isLast = index === timeline.length - 1;
            return (
              <li key={activity.id} className={`ms-6 space-y-2 ${isLast ? "" : "mb-10"}`}>
                <span className="bg-muted absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full border">
                  <Icon className="text-primary size-3" aria-hidden />
                </span>
                <h3 className="flex flex-wrap items-center font-semibold">
                  {activity.title}
                  {index === 0 ? (
                    <Badge variant="outline" className="ms-2">
                      Latest
                    </Badge>
                  ) : null}
                </h3>
                <time
                  dateTime={new Date(activity.createdAt).toISOString()}
                  className="text-muted-foreground flex items-center gap-1.5 text-sm leading-none">
                  <Clock className="size-3" aria-hidden />
                  {new Date(activity.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                </time>
                {activity.detail || activity.type ? (
                  <p className="text-muted-foreground text-sm">
                    {activity.detail ?? activity.type.replaceAll("_", " ")}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </CrmActivityPanelShell>
  );
}
