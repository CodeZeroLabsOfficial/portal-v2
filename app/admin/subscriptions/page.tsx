import { connection } from "next/server";
import { redirect } from "next/navigation";

import { SubscriptionListPanel } from "@/components/features/subscription/subscription-list-panel";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getAdminSubscriptionsSnapshot } from "@/server/firestore/crm-customers";
import { listCatalogServicePickerOptionsForOrg } from "@/server/firestore/catalog-services";
import { getAdminCustomerListRows } from "@/server/firestore/portal-data";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  await connection();
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/subscriptions");
  }

  const [data, customers, catalogServiceOptions] = await Promise.all([
    getAdminSubscriptionsSnapshot(user),
    getAdminCustomerListRows(user),
    listCatalogServicePickerOptionsForOrg(user)
  ]);

  const rows =
    data?.subscriptions.map((sub) => {
      const stripeCus = sub.customerId.trim();
      const link = stripeCus ? data.stripeCustomerLinks[stripeCus] : undefined;
      return {
        subscription: sub,
        accountName: link?.accountName ?? "—",
        crmCustomerId: link?.customerId
      };
    }) ?? [];

  const customerOptions = customers
    .filter((c) => c.status === "active")
    .map((c) => ({
      id: c.id,
      label: [c.company?.trim(), c.name?.trim(), c.email?.trim()].filter(Boolean).join(" · ")
    }));

  return (
    <SubscriptionListPanel
      rows={rows}
      customerOptions={customerOptions}
      catalogServiceOptions={catalogServiceOptions}
    />
  );
}
