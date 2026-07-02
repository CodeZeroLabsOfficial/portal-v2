import { connection } from "next/server";
import { redirect } from "next/navigation";

import { CatalogServicesListPanel } from "@/components/features/catalog/catalog-services-list-panel";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { listCatalogServicesForOrg } from "@/server/firestore/catalog-services";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  await connection();
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/services");
  }

  const services = await listCatalogServicesForOrg(user);

  return <CatalogServicesListPanel services={services} />;
}
