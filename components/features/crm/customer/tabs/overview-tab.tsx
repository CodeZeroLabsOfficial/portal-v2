import { CustomerLatestActivity } from "@/components/features/crm/customer/customer-latest-activity";
import type { CustomerActivityRecord } from "@/types/customer";

export interface CustomerOverviewTabProps {
  customerId: string;
  activities: CustomerActivityRecord[];
}

export function CustomerOverviewTab({ customerId, activities }: CustomerOverviewTabProps) {
  return <CustomerLatestActivity customerId={customerId} activities={activities} />;
}
