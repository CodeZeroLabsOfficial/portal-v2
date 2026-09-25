import type { ReactNode } from "react";

import { CustomerLatestActivity } from "@/components/features/crm/customer/customer-latest-activity";
import type { CustomerActivityRecord } from "@/types/customer";

export interface CustomerOverviewTabProps {
  customerId: string;
  activities: CustomerActivityRecord[];
  aside: ReactNode;
}

export function CustomerOverviewTab({ customerId, activities, aside }: CustomerOverviewTabProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="space-y-4 xl:col-span-1">{aside}</div>
      <div className="space-y-4 xl:col-span-2">
        <CustomerLatestActivity customerId={customerId} activities={activities} />
      </div>
    </div>
  );
}
