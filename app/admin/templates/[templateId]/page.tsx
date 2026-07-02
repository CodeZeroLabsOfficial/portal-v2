import { notFound, redirect } from "next/navigation";

import { ComingSoonPage } from "@/components/shared/coming-soon-page";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getProposalTemplateForStaff } from "@/server/firestore/proposal-templates";

interface PageProps {
  params: Promise<{ templateId: string }>;
}

export default async function EditProposalTemplatePage({ params }: PageProps) {
  const { templateId } = await params;
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/admin/templates/${templateId}`)}`);
  }

  const template = await getProposalTemplateForStaff(user, templateId);
  if (!template) {
    notFound();
  }

  return (
    <ComingSoonPage
      title={template.name}
      phase="Phase 4 — Proposals"
      description="Proposal template editor — blocks apply when creating a proposal from CRM."
    />
  );
}
