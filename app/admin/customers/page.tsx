import { connection } from "next/server";
import { redirect } from "next/navigation";

import { CustomerListPanel } from "@/components/features/crm/customer/customer-list-panel";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getAdminCustomerListRows } from "@/server/firestore/portal-data";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await connection();
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/customers");
  }

  const rows = await getAdminCustomerListRows(user);

  return <CustomerListPanel rows={rows} />;
}
