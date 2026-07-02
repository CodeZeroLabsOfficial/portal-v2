import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhooks are handled by the Firebase Cloud Function `stripeWebhook`.
 * This route returns 410 so misconfigured Stripe endpoints do not double-process events.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Stripe webhooks have moved to Firebase Cloud Functions (stripeWebhook). Update your Stripe Dashboard endpoint and disable this URL.",
    },
    { status: 410 },
  );
}
