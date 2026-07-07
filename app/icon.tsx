import { connection } from "next/server";

import { buildPortalIconResponse } from "@/lib/branding/portal-icon";

export const dynamic = "force-dynamic";

/** Dynamic portal favicon — branding upload with bundled default fallback. */
export default async function Icon() {
  await connection();
  return buildPortalIconResponse();
}
