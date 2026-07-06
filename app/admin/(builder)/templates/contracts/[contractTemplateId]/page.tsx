import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

import { ProposalBuilderWorkspace } from "@/components/features/proposal/editor/proposal-builder-workspace";
import { Typography } from "@/components/ui/typography";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { contractTemplateRecordToDocument } from "@/lib/contract-template/document";
import { batchGetUserSummaries } from "@/lib/users/user-summaries";
import { getContractTemplateForStaff } from "@/server/firestore/contract-templates";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ contractTemplateId: string }>;
}

export default async function EditContractTemplateBuilderPage({ params }: PageProps) {
  await connection();
  const { contractTemplateId } = await params;
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/admin/templates/contracts/${contractTemplateId}`)}`,
    );
  }

  const row = await getContractTemplateForStaff(user, contractTemplateId);
  if (!row) {
    notFound();
  }

  const document = contractTemplateRecordToDocument(row);
  const authorByUid = await batchGetUserSummaries([row.createdByUid]);
  const templateAuthor = authorByUid.get(row.createdByUid.trim());

  return (
    <ProposalBuilderWorkspace
      backHref="/admin/templates"
      backLabel="Templates"
      titleFallback={row.name?.trim() || "Untitled contract"}
      brandingSlot={
        <Typography variant="muted" className="text-sm">
          Agreement layout and copy are edited on blocks in the canvas.
        </Typography>
      }
      variant="contract-template"
      contractTemplateId={row.id}
      initialTemplateName={row.name}
      initialTemplateDescription={row.description ?? ""}
      initialCatalogMeta={row.catalogMeta}
      initialTemplateAuthor={templateAuthor}
      initialTemplateStage={row.stage}
      initialAgreementTitle={row.agreementTitle}
      initialDocument={document}
      localityTimeZone={user.timeZone?.trim() || undefined}
    />
  );
}
