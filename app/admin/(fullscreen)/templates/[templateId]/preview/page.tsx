import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  ProposalPublicPreviewBar,
  ProposalPublicPreviewFrame,
} from "@/components/features/proposal/viewer/public-preview-bar";
import { ProposalDocumentView } from "@/components/proposal/proposal-document-view";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { syncProposalDocumentPackageTiersFromCatalog } from "@/lib/proposal/commerce/package-catalog-sync";
import { proposalEndsInFullBleedBand } from "@/lib/proposal/blocks";
import {
  PROPOSAL_PUBLIC_DOCUMENT_OUTER_CLASSES,
  PROPOSAL_PUBLIC_PREVIEW_MAIN_OFFSET_CLASSES,
  proposalPublicMainClasses,
} from "@/lib/proposal/public/public-layout";
import { listCatalogServicePickerOptionsForOrg } from "@/server/firestore/catalog-services";
import { getProposalTemplateForStaff } from "@/server/firestore/proposal-templates";
import { hydrateAgreementBlocksInDocument } from "@/server/proposal/hydrate-agreement-contract-templates";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ templateId: string }>;
}

/** Staff preview — same layout as `/p/[token]` without a live share link. */
export default async function ProposalTemplatePublicPreviewPage({ params }: PageProps) {
  const { templateId } = await params;
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/admin/templates/${templateId}/preview`)}`);
  }

  const template = await getProposalTemplateForStaff(user, templateId);
  if (!template) {
    notFound();
  }

  const organizationId = user.organizationId ?? "default";
  const [hydrated, catalogServices] = await Promise.all([
    hydrateAgreementBlocksInDocument(template.document, organizationId),
    listCatalogServicePickerOptionsForOrg(user),
  ]);
  const previewDocument = syncProposalDocumentPackageTiersFromCatalog(hydrated, catalogServices);

  const flushBottom = proposalEndsInFullBleedBand(previewDocument.blocks);

  return (
    <ProposalPublicPreviewFrame
      bar={
        <ProposalPublicPreviewBar
          title="Public preview"
          description="Recipients see this layout on a published proposal; package actions stay in preview mode until a real link exists."
          backHref={`/admin/templates/${template.id}`}
        />
      }
    >
      <main
        className={`${proposalPublicMainClasses({ flushBottom })} ${PROPOSAL_PUBLIC_PREVIEW_MAIN_OFFSET_CLASSES}`}
      >
        <div className={PROPOSAL_PUBLIC_DOCUMENT_OUTER_CLASSES}>
          <ProposalDocumentView
            document={previewDocument}
            branding={template.branding}
            localityTimeZone={user.timeZone?.trim() || undefined}
          />
        </div>
      </main>
    </ProposalPublicPreviewFrame>
  );
}
