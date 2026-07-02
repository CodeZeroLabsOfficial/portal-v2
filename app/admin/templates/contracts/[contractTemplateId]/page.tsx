import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

import { ProposalDocumentEditorLazy } from "@/components/proposal/proposal-document-editor-lazy";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { contractTemplateRecordToDocument } from "@/lib/contract-template/document";
import { getContractTemplateForStaff } from "@/server/firestore/contract-templates";

export const dynamic = "force-dynamic";

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

  const row = await getContractTemplateForStaff(user, contractTemplateId);
  if (!row) {
    notFound();
  }

  const document = contractTemplateRecordToDocument(row);

  return (
    <ProposalDocumentEditorLazy
      variant="contract-template"
      contractTemplateId={row.id}
      initialTemplateName={row.name}
      initialTemplateDescription={row.description ?? ""}
      initialAgreementTitle={row.agreementTitle}
      initialDocument={document}
      localityTimeZone={user.timeZone?.trim() || undefined}
    />
  );
}
