import { buildPortalIconResponse } from "@/lib/branding/portal-icon";

export const dynamic = "force-dynamic";

/** Serves the same dynamic icon at `/favicon.ico` for browsers that request it directly. */
export async function GET() {
  return buildPortalIconResponse();
}
