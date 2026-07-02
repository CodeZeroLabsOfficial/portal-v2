import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ContractTemplateAgreementPreview } from "@/components/features/templates/contract-template-agreement-preview";
import { Button } from "@/components/ui/button";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { contractTemplateRecordToDocument } from "@/lib/contract-template/document";
import { PROPOSAL_PUBLIC_PAGE_COLUMN_CLASSES } from "@/lib/proposal/public/public-layout";
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
      `/login?next=${encodeURIComponent(`/admin/templates/contracts/${contractTemplateId}/preview`)}`
    );
  }

  const row = await getContractTemplateForStaff(user, contractTemplateId);
  if (!row) {
    notFound();
  }

  const document = contractTemplateRecordToDocument(row);

  return (
    <div className="bg-muted relative min-h-dvh">
      <header className="border-border/80 bg-background/85 supports-[backdrop-filter]:bg-background/70 fixed inset-x-0 top-0 z-50 border-b py-3 shadow-sm backdrop-blur-md">
        <div
          className={`${PROPOSAL_PUBLIC_PAGE_COLUMN_CLASSES} flex flex-wrap items-center justify-between gap-3`}>
          <p className="text-muted-foreground text-sm">
            <span className="text-foreground font-medium">Agreement preview</span>
            {" — "}
            Buyers see this layout in the View Agreement modal when this template is attached to an Accept
            block.
          </p>
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5" asChild>
            <Link href={`/admin/templates/contracts/${row.id}`}>
              <ArrowLeft className="size-4" aria-hidden />
              Back to edit
            </Link>
          </Button>
        </div>
      </header>
      <main className="pt-16">
        <ContractTemplateAgreementPreview document={document} agreementTitle={row.agreementTitle} />
      </main>
    </div>
  );
}
