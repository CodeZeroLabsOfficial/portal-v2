export const CUSTOMER_DETAIL_TAB_VALUES = [
  "overview",
  "billing",
  "subscriptions",
  "proposals",
  "notes",
  "documents",
  "tasks",
  "vault"
] as const;

export type CustomerDetailTab = (typeof CUSTOMER_DETAIL_TAB_VALUES)[number];

export function isCustomerDetailTab(value: string | undefined): value is CustomerDetailTab {
  return Boolean(value && (CUSTOMER_DETAIL_TAB_VALUES as readonly string[]).includes(value));
}
