import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

import { AccountDetailView } from "@/components/features/crm/account/account-detail-view";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getAdminAccountDetail } from "@/server/firestore/portal-data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ accountKey: string }>;
}

export default async function AdminAccountDetailPage({ params }: PageProps) {
  await connection();
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/accounts");
  }

  const { accountKey } = await params;
  const account = await getAdminAccountDetail(user, accountKey);
  if (!account) {
    notFound();
  }

  return <AccountDetailView account={account} />;
}
