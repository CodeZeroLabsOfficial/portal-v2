import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";

export const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
export const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const secret = stripeSecretKey.value().trim();
  if (!secret) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(secret, { typescript: true });
  }
  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  const secret = stripeWebhookSecret.value().trim();
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }
  return secret;
}
