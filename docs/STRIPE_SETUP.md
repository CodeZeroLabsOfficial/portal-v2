# Stripe integration

This portal syncs Stripe **Customers**, **Subscriptions**, **Invoices**, and **PaymentIntents** into Firestore via signed webhooks, exposes staff actions on **Proposals**, and lets end customers open the **Stripe Customer Billing Portal** on your own domain.

## 1. Stripe Dashboard

1. Create or open your [Stripe Dashboard](https://dashboard.stripe.com) account (test mode while integrating).
2. Under **Developers → API keys**, copy the **Secret key** (`sk_live_…` / `sk_test_…`).
3. Under **Developers → Webhooks → Add endpoint**, point to the deployed Firebase function:

   `https://australia-southeast1-<firebase-project-id>.cloudfunctions.net/stripeWebhook`

   (Gen2 URLs may use `https://stripewebhook-<hash>-<region>.a.run.app` — copy the URL from `firebase deploy` output or the Firebase console.)

4. Select events (minimum set used by this codebase):

   - `customer.created`, `customer.updated`, `customer.deleted`
   - `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - `invoice.created`, `invoice.updated`, `invoice.finalized`, `invoice.paid`, `invoice.payment_failed`, `invoice.voided`
   - `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`

5. After saving the endpoint, reveal the **Signing secret** (`whsec_…`) and store it as a Firebase secret (see below).

6. **Disable** any legacy endpoint that pointed at `https://<your-domain>/api/webhooks/stripe` — only one webhook URL should be active.

## 2. Environment variables and secrets

### Firebase Cloud Functions (webhook — required)

Set via [Firebase secret manager](https://firebase.google.com/docs/functions/config-env):

| Secret | Purpose |
|--------|---------|
| `STRIPE_SECRET_KEY` | Stripe SDK inside `stripeWebhook` |
| `STRIPE_WEBHOOK_SECRET` | Verifies `Stripe-Signature` on the function |

Deploy:

```bash
cd functions && npm run build && firebase deploy --only functions:stripeWebhook
```

Local forwarding (replace URL with your function endpoint):

```bash
stripe listen --forward-to https://australia-southeast1-<project>.cloudfunctions.net/stripeWebhook
```

### Next.js app (staff/customer routes — not the webhook)

Set on your hosting provider (e.g. Vercel) or in `.env.local` for development:

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Server-side Stripe SDK — invoices, Checkout, Billing Portal |
| `STRIPE_DEFAULT_SUBSCRIPTION_PRICE_ID` | Optional `price_…` id for proposal “Checkout (subscription)” without prompting |
| `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS` | Firebase Admin — required for Firestore writes |
| `NEXT_PUBLIC_APP_URL` | Optional fallback origin if reverse-proxy headers are missing |

`STRIPE_WEBHOOK_SECRET` is **not** required on the Next.js host after migrating to Firebase.

Never expose secret keys to the browser; only `NEXT_PUBLIC_*` belongs in client bundles.

## 3. Firestore layout

Webhook handlers write to:

| Collection | Document id | Contents |
|------------|-------------|----------|
| `stripe_customers` | Stripe Customer id `cus_…` | Email, name, metadata mirror |
| `subscriptions` | Stripe Subscription id `sub_…` | Status, price, period end, optional `mrrAmount` |
| `invoices` | Stripe Invoice id `in_…` | Amount due, hosted/PDF URLs, `invoiceNumber`, status |
| `payments` | Stripe PaymentIntent id `pi_…` | Amount, status |
| `stripe_webhook_events` | Stripe Event id `evt_…` | Idempotency marker |

Rows include `customerId` (Stripe `cus_…`) and optional `organizationId` from Stripe metadata (`organization_id`).

Matched portal users also receive mirrors under `users/{uid}/invoices`, `users/{uid}/subscriptions`, and `users/{uid}/payments`.

### Linking CRM contacts

When a Stripe Customer includes an **email** that matches `customers/{id}.email` in Firestore, the sync attempts to set `stripeCustomerId` on those CRM rows so staff views stay aligned.

### Security rules

Webhook endpoints write with **Admin SDK** only. Client reads must go through rules that scope data by `organizationId` or the portal user’s `stripeCustomerId`. Tighten rules before production exposure.

## 4. Next.js routes

| Route | Role | Behavior |
|-------|------|----------|
| `POST /api/webhooks/stripe` | Deprecated | Returns **410 Gone** — use Firebase `stripeWebhook` instead |
| `POST /api/stripe/billing-portal` | Signed-in customer | Creates Billing Portal session; requires `users/{uid}.stripeCustomerId` |
| `POST /api/stripe/proposal-invoice` | Admin / team | Builds totals from proposal pricing + accepted packages; creates & finalizes a Stripe Invoice |
| `POST /api/stripe/proposal-checkout` | Admin / team | Creates Checkout Session — `mode: "payment"` uses computed totals; `mode: "subscription"` requires a `price_…` |

Staff UX lives on `/admin/proposals/[proposalId]` (Stripe billing card). Customers use `/customer` for portal entry, invoices list, and **Manage billing & invoices**.

## 5. Shared sync implementation

Firestore mirror logic lives in `shared/stripe/stripe-sync.ts` (`applyStripeWebhookEvent`). It is used by:

- Firebase **`stripeWebhook`** (canonical writer for Stripe events)
- Next.js server actions that upsert subscription rows after staff creates schedules

The `functions/` build copies `shared/stripe` into `src/_shared` before `tsc` so deployed bundles are self-contained.

Keeping **one** Stripe webhook endpoint (Firebase only) avoids duplicate processing. Idempotency is enforced via `stripe_webhook_events`.

### Official Firebase Extensions

Stripe maintains Firebase Extensions for specific workflows (e.g. catalog or payments helpers). This project already mirrors billing entities into first-party collections; only add extensions that do not conflict on the same document paths.

## 6. Operational checklist

- [ ] Firebase `stripeWebhook` deployed and reachable over HTTPS from Stripe.
- [ ] `STRIPE_WEBHOOK_SECRET` set as a Firebase secret matching the active Stripe endpoint.
- [ ] Legacy Next.js webhook URL disabled in Stripe Dashboard.
- [ ] `STRIPE_SECRET_KEY` on Firebase (functions) and Next.js (create routes).
- [ ] Firebase Admin credentials present on the Next.js server.
- [ ] Customer Portal branding configured under Stripe **Settings → Billing → Customer portal**.
- [ ] Test mode end-to-end: invoice from proposal → webhook rows appear → staff/customer views show mirrors.
