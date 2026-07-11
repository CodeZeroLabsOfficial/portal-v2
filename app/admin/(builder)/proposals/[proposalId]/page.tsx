import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

import { ProposalBuilderMetadata } from "@/components/features/proposal/proposal-builder-metadata";
import { ProposalShareSettings } from "@/components/features/proposal/proposal-share-settings";
import { ProposalBuilderWorkspace } from "@/components/features/proposal/editor/proposal-builder-workspace";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { getCustomerRecordForOrg } from "@/server/firestore/crm-customers";
import { listCatalogServicePickerOptionsForOrg } from "@/server/firestore/catalog-services";
import { getAdminProposalRecord } from "@/server/firestore/portal-data";
import { getProposalTemplateNameForOrganization } from "@/server/firestore/proposal-templates";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ proposalId: string }>;
  searchParams: Promise<{ customer?: string | string[] }>;
}

function firstQueryString(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  return t.length > 0 ? t : null;
}

export default async function AdminProposalBuilderPage({ params, searchParams }: PageProps) {
  await connection();
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/proposals");
  }

  const { proposalId } = await params;
  const proposal = await getAdminProposalRecord(user, proposalId);
  if (!proposal) {
    notFound();
  }

  const catalogServiceOptions = await listCatalogServicePickerOptionsForOrg(user);
  const sp = await searchParams;
  const customerBackId = proposal.customerId?.trim() || firstQueryString(sp.customer);

  const customerId = proposal.customerId?.trim() || null;
  const sourceTemplateId = proposal.sourceTemplateId?.trim() || null;
  const db = getFirebaseAdminFirestore();
  const [recipientCustomer, templateName] = await Promise.all([
    customerId ? getCustomerRecordForOrg(user, customerId) : Promise.resolve(null),
    sourceTemplateId && db
      ? getProposalTemplateNameForOrganization(db, proposal.organizationId, sourceTemplateId)
      : Promise.resolve(null),
  ]);
  const recipientDisplayName =
    recipientCustomer?.name.trim() || recipientCustomer?.email.trim() || null;

  return (
    <ProposalBuilderWorkspace
      backHref={customerBackId ? `/admin/customers/${encodeURIComponent(customerBackId)}` : "/admin/proposals"}
      backLabel={customerBackId ? "Customer" : "Proposals"}
      titleFallback={proposal.document.title?.trim() || "Untitled proposal"}
      detailsSlot={
        <ProposalBuilderMetadata
          proposal={proposal}
          recipientDisplayName={recipientDisplayName}
          customerId={customerId}
          templateName={templateName}
          sourceTemplateId={sourceTemplateId}
          variant="inspector"
        />
      }
      shareSlot={
        <ProposalShareSettings
          proposalId={proposal.id}
          hasPassword={Boolean(proposal.sharePasswordHash)}
          variant="plain"
        />
      }
      proposalId={proposal.id}
      initialDocument={proposal.document}
      initialBranding={proposal.branding}
      initialStatus={proposal.status}
      localityTimeZone={user.timeZone?.trim() || undefined}
      catalogServiceOptions={catalogServiceOptions}
      proposalCategory={proposal.category}
      proposalEditShellToolbar={{
        customerBackHref: customerBackId
          ? `/admin/customers/${encodeURIComponent(customerBackId)}`
          : null,
        recipientEmail: proposal.recipientEmail?.trim() || null,
        shareToken: proposal.shareToken?.trim() || null,
      }}
    />
  );
}
