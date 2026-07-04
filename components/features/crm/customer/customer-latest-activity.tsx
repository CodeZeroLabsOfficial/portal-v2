import { Clock } from "lucide-react";

import { CrmActivityTimelineItem } from "@/components/shared/crm-activity-timeline-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { customerActivityIcon } from "@/lib/crm/customer-activity-display";
import type { CustomerActivityRecord } from "@/types/customer";

const ACTIVITY_PREVIEW_LIMIT = 10;

export interface CustomerLatestActivityProps {
  customerId: string;
  activities: CustomerActivityRecord[];
}

export function CustomerLatestActivity({ customerId, activities }: CustomerLatestActivityProps) {
  const timeline = [...activities]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, ACTIVITY_PREVIEW_LIMIT);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Activity</CardTitle>
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
                Notes, calls, emails, and Stripe syncs will show up here as they happen.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ol className="relative border-s">
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
                  icon={customerActivityIcon(activity.type)}
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
      </CardContent>
    </Card>
  );
}
