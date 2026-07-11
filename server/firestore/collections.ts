/**
 * Firestore collection names — single source of truth for paths and query helpers.
 *
 * Security rules (high level — implement in Firebase console):
 * - `users`: user can read/write own doc; admins can read org members via custom claims or backend checks.
 * - `users/{uid}/subscriptions`, `users/{uid}/invoices`, `users/{uid}/payments`, `users/{uid}/paymentMethods`: portal billing mirrors (webhooks / functions).
 * - Top-level `subscriptions`, `invoices`, `payments`: org-scoped staff views and legacy customerId-indexed mirrors.
 * - `opportunities`: staff-only reads/writes (Admin SDK in this app); add rules matching `customers` if exposed to clients.
 * - `proposals`, `proposal_templates`, `contract_templates`, `services`: org-scoped staff;
 *   public proposal flows use Admin SDK (not client reads). See `firestore.rules`.
 * - `tasks`: staff-only; mutations mostly Admin SDK (limited client status updates).
 * - `notifications`: staff inbox; recipient may read own docs; writes Admin SDK only.
 * - `analytics_events`: insert from authenticated viewer session or validated public token; reads restricted to proposal owners.
 * - `signedAgreements`: append-only snapshots when a proposal is accepted with a signature (Admin SDK).
 */
export const COLLECTIONS = {
  users: "users",
  /** CRM customer profiles (single-tenant); optional `portalUserId` links `users/{uid}`. */
  customers: "customers",
  /** Sales opportunities — `customerId` references `customers`. */
  opportunities: "opportunities",
  /** Free-form notes attached to an opportunity — keyed by `opportunityId`. */
  opportunityNotes: "opportunity_notes",
  /** Logged interactions (meetings, calls, emails) on an opportunity — keyed by `opportunityId`. */
  opportunityActivities: "opportunity_activities",
  /** Timeline entries (created, note added, Stripe sync, etc.) — keyed by `customerId`. */
  customerActivities: "customer_activities",
  /** Internal notes, calls, emails — keyed by `customerId`. */
  customerNotes: "customer_notes",
  subscriptions: "subscriptions",
  invoices: "invoices",
  /** PaymentIntent mirrors — synced from Stripe webhooks (`payment_intent.*`). */
  payments: "payments",
  /** Stripe Customer objects mirrored by id (`cus_…`). */
  stripeCustomers: "stripe_customers",
  /** Processed Stripe event ids — webhook idempotency (`evt_…`). */
  stripeWebhookEvents: "stripe_webhook_events",
  proposals: "proposals",
  /** Immutable snapshots when a proposal is accepted with signature metadata (Admin SDK writes). */
  signedAgreements: "signedAgreements",
  proposalTemplates: "proposal_templates",
  /** Reusable agreement HTML for Accept blocks — staff-managed library. */
  contractTemplates: "contract_templates",
  analyticsEvents: "analytics_events",
  /** Optional — admin dashboard aggregates when present. */
  tasks: "tasks",
  /** Staff in-app inbox — one doc per recipient per event (Admin SDK writes). */
  notifications: "notifications",
  supportTickets: "support_tickets",
  /** Workspace company profile — one doc per org (`organizations/{orgId}`). */
  organizations: "organizations",
  /** Global portal configuration — e.g. `branding` for appearance settings. */
  appSettings: "app_settings",
  /**
   * Portal service catalogue — synced to Stripe Products/Prices on activate.
   * (Renamed from `catalog_services`; migrate existing docs in Firebase if needed.)
   */
  services: "services",
  /** Org product-line categories for catalogue services, templates, and proposals. */
  catalogCategories: "catalog_categories",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
