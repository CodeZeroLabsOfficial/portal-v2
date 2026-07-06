import { notFound, redirect } from "next/navigation";

import { CatalogServiceDetailView } from "@/components/features/catalog/catalog-service-detail-view";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getCatalogServiceForStaff } from "@/server/firestore/catalog-services";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ serviceId: string }>;
}

export default async function AdminServiceDetailPage({ params }: PageProps) {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/services");
  }

  const { serviceId } = await params;
  const service = await getCatalogServiceForStaff(user, serviceId);
  if (!service) {
    notFound();
  }

  return <CatalogServiceDetailView service={service} />;
}
