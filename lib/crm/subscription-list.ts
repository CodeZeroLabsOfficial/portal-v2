import type { SubscriptionRecord } from "@/types/subscription";

export interface SubscriptionListRow {
  subscription: SubscriptionRecord;
  /** Company-first label from CRM; not linked subscriptions show — */
  accountName: string;
  crmCustomerId?: string;
}
