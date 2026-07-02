import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

import { AccountEditForm } from "@/components/features/crm/account/account-edit-form";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getAdminAccountDetail } from "@/server/firestore/portal-data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ accountKey: string }>;
}

export default async function AdminAccountEditPage({ params }: PageProps) {
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

  return <AccountEditForm account={account} accountKey={accountKey} />;
}
