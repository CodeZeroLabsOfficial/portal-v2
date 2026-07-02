import { connection } from "next/server";
import { redirect } from "next/navigation";

import { ProposalsListPanel } from "@/components/features/proposal/proposals-list-panel";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { listProposalsHubRowsForStaffOrg } from "@/server/firestore/portal-data";

export const dynamic = "force-dynamic";

export default async function AdminProposalsPage() {
  await connection();
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/proposals");
  }

  const rows = await listProposalsHubRowsForStaffOrg(user);

  return (
    <ProposalsListPanel
      rows={rows}
      localityTimeZone={user.timeZone?.trim() || undefined}
    />
  );
}
