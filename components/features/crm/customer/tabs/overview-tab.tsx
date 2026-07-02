import { CustomerLatestActivity } from "@/components/features/crm/customer/customer-latest-activity";
import type { CustomerActivityRecord } from "@/types/customer";

export interface CustomerOverviewTabProps {
  activities: CustomerActivityRecord[];
}

export function CustomerOverviewTab({ activities }: CustomerOverviewTabProps) {
  return <CustomerLatestActivity activities={activities} />;
}
