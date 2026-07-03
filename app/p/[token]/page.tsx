import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProposalPublicPageShell } from "@/components/features/proposal/viewer/public-page-shell";
import { ProposalAnalyticsTracker } from "@/components/proposal/proposal-analytics-tracker";
import { ProposalDocumentView } from "@/components/proposal/proposal-document-view";
import { ProposalPasswordGate } from "@/components/proposal/proposal-password-gate";
import { ProposalPublicFooter } from "@/components/proposal/proposal-public-footer";
import { hasAgreementBlock, proposalEndsInFullBleedBand } from "@/lib/proposal/blocks";
import { getStripePublishableKey } from "@/lib/stripe/publishable-key";
import { PROPOSAL_PUBLIC_PAGE_ROOT_CLASSES } from "@/lib/proposal/public/public-layout";
import { isProposalUnlockedForRequest } from "@/lib/proposal/public/public-session";
import { listCatalogServicePickerOptionsForOrganizationId } from "@/server/firestore/catalog-services";
import { getProposalRecordByShareToken } from "@/server/firestore/parse-proposal";
import { getUserStoredTimeZone } from "@/server/firestore/user-locality";
import { hydrateAgreementBlocksInDocument } from "@/server/proposal/hydrate-agreement-contract-templates";
import { loadProposalCustomerSignerPrefill } from "@/server/proposal/public-proposal-customer-signer-prefill";
import { loadProposalPublicSubscriptionUi } from "@/server/proposal/public-proposal-subscription-ui";

export const dynamic = "force-dynamic";

interface PublicProposalPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata(props: PublicProposalPageProps): Promise<Metadata> {
  const params = await props.params;
  const token = params.token?.trim();
  if (!token || token.length < 8) {
    return { title: "Proposal" };
  }
  const proposal = await getProposalRecordByShareToken(token);
  if (!proposal || proposal.status === "draft") {
    return { title: "Proposal" };
  }
  return {
    title: "Proposal",
    robots: "noindex, nofollow",
  };
}

/** Public proposal viewer — token-based share link. Draft proposals are not exposed. */
export default async function PublicProposalPage(props: PublicProposalPageProps) {
  const params = await props.params;
  const token = params.token?.trim();

  if (!token || token.length < 8) {
    notFound();
  }

  const proposal = await getProposalRecordByShareToken(token);
  if (!proposal || proposal.status === "draft") {
    notFound();
  }

  const localityTimeZone = (await getUserStoredTimeZone(proposal.createdByUid))?.trim() || undefined;

  const requiresPassword = Boolean(proposal.sharePasswordHash);
  const unlocked = !requiresPassword || (await isProposalUnlockedForRequest(proposal.id));

  const publicDocument = unlocked
    ? await hydrateAgreementBlocksInDocument(proposal.document, proposal.organizationId)
    : proposal.document;

  const agreementPresent = hasAgreementBlock(publicDocument.blocks);
  const [publicSubscriptionUi, customerSignerPrefill, catalogServices, stripePublishableKey] = unlocked
    ? await Promise.all([
        agreementPresent ? loadProposalPublicSubscriptionUi(proposal) : Promise.resolve(null),
        proposal.customerId?.trim()
          ? loadProposalCustomerSignerPrefill(proposal)
          : Promise.resolve(null),
        listCatalogServicePickerOptionsForOrganizationId(proposal.organizationId),
        getStripePublishableKey(),
      ])
    : [null, null, [], undefined];

  const showFooter = !agreementPresent || proposal.status === "accepted";
  const flushBottom = !showFooter && proposalEndsInFullBleedBand(publicDocument.blocks);

  return (
    <div className={PROPOSAL_PUBLIC_PAGE_ROOT_CLASSES}>
      <ProposalPublicPageShell
        locked={!unlocked}
        flushBottom={unlocked ? flushBottom : false}
        analytics={unlocked ? <ProposalAnalyticsTracker shareToken={proposal.shareToken} /> : null}
        document={
          unlocked ? (
            <ProposalDocumentView
              document={publicDocument}
              branding={proposal.branding}
              shareToken={proposal.shareToken}
              publicSelections={proposal.publicSelections}
              proposalStatus={proposal.status}
              acceptedByName={proposal.acceptedByName}
              acceptedSignatureDataUrl={proposal.acceptedSignatureDataUrl}
              acceptedAt={proposal.acceptedAt}
              localityTimeZone={localityTimeZone}
              publicSubscriptionUi={publicSubscriptionUi}
              customerSignerPrefill={customerSignerPrefill}
              catalogServices={catalogServices}
              stripePublishableKey={stripePublishableKey}
            />
          ) : (
            <ProposalPasswordGate shareToken={proposal.shareToken} />
          )
        }
        footer={
          unlocked && showFooter ? (
            <ProposalPublicFooter
              shareToken={proposal.shareToken}
              status={proposal.status}
              acceptedByName={proposal.acceptedByName}
              hideAcceptanceForm={agreementPresent}
            />
          ) : null
        }
      />
    </div>
  );
}
