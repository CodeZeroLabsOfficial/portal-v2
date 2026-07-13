/** Rows for the admin customer list table (CRM-style UI). */
export interface CustomerListRow {
  /** Firestore `customers/{id}` document id. */
  id: string;
  name: string;
  email: string;
  phone: string;
  /** City, region, country — formatted for table display. */
  location: string;
  avatarUrl?: string;
  /** Linked account company name when `accountId` is set. */
  company?: string;
  /** Firestore `accounts/{id}` when linked. */
  accountId?: string;
  tags: string[];
  crmType: import("@/types/customer").CustomerCrmType;
  status: "active" | "archived";
  subscriptionRollup: import("@/types/customer").CustomerSubscriptionRollup;
  portalUserId?: string;
  stripeCustomerId?: string;
}
