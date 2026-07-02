import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

import { ComingSoonPage } from "@/components/shared/coming-soon-page";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getContractTemplateForStaff } from "@/server/firestore/contract-templates";

interface PageProps {
  params: Promise<{ contractTemplateId: string }>;
}

export default async function EditContractTemplatePage({ params }: PageProps) {
  await connection();
  const { contractTemplateId } = await params;
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/admin/templates/contracts/${contractTemplateId}`)}`
    );
  }

  const template = await getContractTemplateForStaff(user, contractTemplateId);
  if (!template) {
    notFound();
  }

  return (
    <ComingSoonPage
      title={template.name}
      phase="Phase 4 — Proposals"
      description="Contract template editor — attach from Accept blocks in the proposal editor."
    />
  );
}
