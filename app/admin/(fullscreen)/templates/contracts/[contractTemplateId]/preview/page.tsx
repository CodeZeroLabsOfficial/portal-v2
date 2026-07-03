import { notFound, redirect } from "next/navigation";

import {
  ProposalPublicPreviewBar,
  ProposalPublicPreviewFrame,
} from "@/components/features/proposal/viewer/public-preview-bar";
import { ContractTemplateAgreementPreview } from "@/components/features/templates/contract-template-agreement-preview";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { contractTemplateRecordToDocument } from "@/lib/contract-template/document";
import { PROPOSAL_PUBLIC_PREVIEW_MAIN_OFFSET_CLASSES } from "@/lib/proposal/public/public-layout";
import { getContractTemplateForStaff } from "@/server/firestore/contract-templates";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ contractTemplateId: string }>;
}

export default async function ContractTemplatePreviewPage({ params }: PageProps) {
  const { contractTemplateId } = await params;
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/admin/templates/contracts/${contractTemplateId}/preview`)}`,
    );
  }

  const row = await getContractTemplateForStaff(user, contractTemplateId);
  if (!row) {
    notFound();
  }

  const document = contractTemplateRecordToDocument(row);

  return (
    <ProposalPublicPreviewFrame
      bar={
        <ProposalPublicPreviewBar
          title="Agreement preview"
          description="Buyers see this layout in the View Agreement modal when this template is attached to an Accept block."
          backHref={`/admin/templates/contracts/${row.id}`}
        />
      }
    >
      <main className={PROPOSAL_PUBLIC_PREVIEW_MAIN_OFFSET_CLASSES}>
        <ContractTemplateAgreementPreview document={document} agreementTitle={row.agreementTitle} />
      </main>
    </ProposalPublicPreviewFrame>
  );
}
