import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ProposalDocumentView } from "@/components/proposal/proposal-document-view";
import { Button } from "@/components/ui/button";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { syncProposalDocumentPackageTiersFromCatalog } from "@/lib/proposal/commerce/package-catalog-sync";
import { proposalEndsInFullBleedBand } from "@/lib/proposal/blocks";
import {
  PROPOSAL_PUBLIC_DOCUMENT_OUTER_CLASSES,
  PROPOSAL_PUBLIC_PAGE_COLUMN_CLASSES
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
    listCatalogServicePickerOptionsForOrg(user)
  ]);
  const previewDocument = syncProposalDocumentPackageTiersFromCatalog(hydrated, catalogServices);

  const flushBottom = proposalEndsInFullBleedBand(previewDocument.blocks);
  const mainClasses = flushBottom
    ? "proposal-print-root w-full pb-0 pt-0 print:pb-0 min-h-dvh"
    : "proposal-print-root w-full pb-12 pt-0 print:pb-8 sm:pb-14 min-h-dvh";

  return (
    <div className="bg-background relative min-h-dvh">
      <header className="border-border/80 bg-background/85 supports-[backdrop-filter]:bg-background/70 fixed inset-x-0 top-0 z-50 border-b py-3 shadow-sm backdrop-blur-md">
        <div
          className={`${PROPOSAL_PUBLIC_PAGE_COLUMN_CLASSES} flex flex-wrap items-center justify-between gap-3`}>
          <p className="text-muted-foreground text-sm">
            <span className="text-foreground font-medium">Public preview</span>
            {" — "}
            Recipients see this layout on a published proposal; package actions stay in preview mode until a real
            link exists.
          </p>
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5" asChild>
            <Link href={`/admin/templates/${template.id}`}>
              <ArrowLeft className="size-4" aria-hidden />
              Back to edit
            </Link>
          </Button>
        </div>
      </header>
      <main className={mainClasses}>
        <div className={PROPOSAL_PUBLIC_DOCUMENT_OUTER_CLASSES}>
          <ProposalDocumentView
            document={previewDocument}
            branding={template.branding}
            localityTimeZone={user.timeZone?.trim() || undefined}
          />
        </div>
      </main>
    </div>
  );
}
