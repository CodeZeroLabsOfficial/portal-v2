export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

export type SubscriptionStatus =
  | "scheduled"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";
