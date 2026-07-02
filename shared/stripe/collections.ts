/** Firestore collection names used by Stripe webhook mirroring. */
export const COLLECTIONS = {
  users: "users",
  customers: "customers",
  subscriptions: "subscriptions",
  invoices: "invoices",
  payments: "payments",
  stripeCustomers: "stripe_customers",
  stripeWebhookEvents: "stripe_webhook_events",
} as const;
