import { connection } from "next/server";
import { redirect } from "next/navigation";

import { TemplatesHubPanel } from "@/components/features/templates/templates-hub-panel";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { buildTemplateHubRows } from "@/lib/templates/hub-rows";
import { batchGetUserSummaries } from "@/lib/users/user-summaries";
import { listContractTemplatesForOrg } from "@/server/firestore/contract-templates";
import { listProposalTemplatesForOrg } from "@/server/firestore/proposal-templates";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  await connection();
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/templates");
  }

  const [proposalTemplates, contractTemplates] = await Promise.all([
    listProposalTemplatesForOrg(user),
    listContractTemplatesForOrg(user)
  ]);

  const authorByUid = await batchGetUserSummaries([
    ...proposalTemplates.map((t) => t.createdByUid),
    ...contractTemplates.map((t) => t.createdByUid),
  ]);
  const rows = buildTemplateHubRows(proposalTemplates, contractTemplates, authorByUid);

  return (
    <TemplatesHubPanel rows={rows} localityTimeZone={user.timeZone?.trim() || undefined} />
  );
}
