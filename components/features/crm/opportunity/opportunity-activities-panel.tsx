"use client";

import * as React from "react";
import { Clock } from "lucide-react";

import { AddOpportunityActivityDialog } from "@/components/features/crm/opportunity/add-opportunity-activity-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { opportunityActivityIcon } from "@/lib/crm/opportunity-activity-display";
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
    <Card>
      <CardHeader>
        <CardTitle>Latest Activity</CardTitle>
        <CardAction>
          <AddOpportunityActivityDialog opportunityId={opportunityId} />
        </CardAction>
      </CardHeader>
      <CardContent className="ps-8">
        {timeline.length === 0 ? (
          <Empty className="border-0 py-8 md:py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Clock />
              </EmptyMedia>
              <EmptyTitle className="text-xl">No activity yet</EmptyTitle>
              <EmptyDescription>
                Log meetings, calls, and emails using the button above.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ol className="relative border-s">
            {timeline.map((activity, index) => {
              const Icon = opportunityActivityIcon(activity.kind);
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
      </CardContent>
    </Card>
  );
}
