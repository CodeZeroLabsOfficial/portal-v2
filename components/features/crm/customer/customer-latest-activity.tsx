import { Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  activities: CustomerActivityRecord[];
}

export function CustomerLatestActivity({ activities }: CustomerLatestActivityProps) {
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
              const Icon = customerActivityIcon(activity.type);
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
      </CardContent>
    </Card>
  );
}
