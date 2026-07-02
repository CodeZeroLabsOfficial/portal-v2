import { connection } from "next/server";
import { redirect } from "next/navigation";

import { AccountListPanel } from "@/components/features/crm/account/account-list-panel";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getAdminAccountListRows } from "@/server/firestore/portal-data";

export const dynamic = "force-dynamic";

export default async function AdminAccountsPage() {
  await connection();
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/accounts");
  }

  const rows = await getAdminAccountListRows(user);

  return <AccountListPanel rows={rows} />;
}
