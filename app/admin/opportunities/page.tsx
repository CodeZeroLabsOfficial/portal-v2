import { connection } from "next/server";
import { redirect } from "next/navigation";

import { OpportunitiesPanel } from "@/components/features/crm/opportunity/opportunities-panel";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { listOpportunityBoardCardsForStaff } from "@/server/firestore/crm-opportunities";

export const dynamic = "force-dynamic";

export default async function AdminOpportunitiesPage() {
  await connection();
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/opportunities");
  }

  const opportunities = await listOpportunityBoardCardsForStaff(user);

  return <OpportunitiesPanel opportunities={opportunities} />;
}
