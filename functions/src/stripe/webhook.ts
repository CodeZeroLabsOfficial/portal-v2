import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";

import { applyStripeWebhookEvent } from "../_shared/stripe-sync";
import { getStripe, getStripeWebhookSecret, stripeSecretKey, stripeWebhookSecret } from "./client";

interface StripeWebhookRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  rawBody?: Buffer;
}

interface StripeWebhookResponse {
  status(code: number): StripeWebhookResponse;
  json(body: unknown): void;
  send(body: string): void;
}

export const stripeWebhook = onRequest(
  {
    region: "australia-southeast1",
    secrets: [stripeSecretKey, stripeWebhookSecret],
  },
  async (req: StripeWebhookRequest, res: StripeWebhookResponse) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    const stripe = getStripe();
    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") {
      res.status(400).json({ error: "Missing Stripe signature." });
      return;
    }

    const rawBody = req.rawBody;
    if (!rawBody || rawBody.length === 0) {
      res.status(400).json({ error: "Missing request body." });
      return;
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid Stripe signature.";
      res.status(400).json({ error: message });
      return;
    }

    if (!admin.apps.length) {
      admin.initializeApp();
    }
    const db = admin.firestore();

    try {
      await applyStripeWebhookEvent(db, event);
      res.status(200).json({ received: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Webhook processing failed.";
      res.status(500).json({ error: message });
    }
  },
);
