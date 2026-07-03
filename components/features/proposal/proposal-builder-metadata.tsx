import Link from "next/link";
import { CircleDot, Clock, Eye, FileText, LayoutTemplate, Mail, Wallet } from "lucide-react";

import { ProposalShareSettings } from "@/components/features/proposal/proposal-share-settings";
import { CrmDetailLabel, CrmDetailValue } from "@/components/shared/crm-detail-label";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyAmount } from "@/lib/common/format";
import {
  isDocumentPackageSelectionComplete,
  listPackagesBlocksInDocument
} from "@/lib/proposal/commerce/package-selection";
import { computeProposalDealValue } from "@/lib/proposal/commerce/packages-totals";
import { getProposalStageBadgeDisplay } from "@/lib/proposal/status-badge";
import type { ProposalRecord } from "@/types/proposal";

export interface ProposalBuilderMetadataProps {
  proposal: ProposalRecord;
  recipientDisplayName: string | null;
  customerId: string | null;
  templateName: string | null;
  sourceTemplateId: string | null;
  /** Sidebar inspector: flat layout without cards or share settings. */
  variant?: "page" | "inspector";
}

export function ProposalBuilderMetadata({
  proposal,
  recipientDisplayName,
  customerId,
  templateName,
  sourceTemplateId,
  variant = "page",
}: ProposalBuilderMetadataProps) {
  const stage = getProposalStageBadgeDisplay(proposal);
  const hasPackagesBlocks = listPackagesBlocksInDocument(proposal.document.blocks).length > 0;
  const packageSelectionComplete = isDocumentPackageSelectionComplete(
    proposal.document.blocks,
    proposal.publicSelections
  );
  const dealValue =
    !hasPackagesBlocks || packageSelectionComplete
      ? computeProposalDealValue(proposal.document.blocks, proposal.publicSelections)
      : null;

  const detailsBody = (
    <dl className="grid gap-4">
      <div className="space-y-1">
        <CrmDetailLabel icon={Mail}>Recipient</CrmDetailLabel>
        <CrmDetailValue empty={!recipientDisplayName && !proposal.recipientEmail?.trim()}>
          {customerId && recipientDisplayName ? (
            <Link
              href={`/admin/customers/${customerId}`}
              className="underline-offset-4 hover:underline">
              {recipientDisplayName}
            </Link>
          ) : proposal.recipientEmail?.trim() ? (
            proposal.recipientEmail.trim()
          ) : (
            "—"
          )}
        </CrmDetailValue>
      </div>
      <div className="space-y-1">
        <CrmDetailLabel icon={CircleDot}>Status</CrmDetailLabel>
        <dd>
          <StatusBadge label={stage.label} variant={stage.variant} title={stage.title} />
        </dd>
      </div>
      <div className="space-y-1">
        <CrmDetailLabel icon={Eye}>Public opens</CrmDetailLabel>
        <CrmDetailValue>
          {typeof proposal.viewCount === "number" ? proposal.viewCount : "Not recorded"}
        </CrmDetailValue>
      </div>
      <div className="space-y-1">
        <CrmDetailLabel icon={Clock}>Approx. engagement</CrmDetailLabel>
        <CrmDetailValue>
          {typeof proposal.totalEngagementSeconds === "number" ? (
            <>
              {Math.max(0, Math.round(proposal.totalEngagementSeconds / 60))} minutes on page
            </>
          ) : (
            "Not recorded"
          )}
        </CrmDetailValue>
      </div>
      <div className="space-y-1">
        <CrmDetailLabel icon={Wallet}>Value</CrmDetailLabel>
        <CrmDetailValue>
          {dealValue ? (
            <span className="font-medium tabular-nums">
              {formatCurrencyAmount(dealValue.totalMinor, dealValue.currency)}
            </span>
          ) : hasPackagesBlocks ? (
            <span className="text-muted-foreground">No selection</span>
          ) : (
            "—"
          )}
        </CrmDetailValue>
      </div>
      <div className="space-y-1">
        <CrmDetailLabel icon={LayoutTemplate}>Template</CrmDetailLabel>
        <CrmDetailValue empty={!sourceTemplateId}>
          {sourceTemplateId ? (
            <Link
              href={`/admin/templates/${sourceTemplateId}`}
              className="underline-offset-4 hover:underline">
              {templateName ?? "Untitled template"}
            </Link>
          ) : (
            "—"
          )}
        </CrmDetailValue>
      </div>
    </dl>
  );

  if (variant === "inspector") {
    return detailsBody;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="text-muted-foreground size-5" aria-hidden />
            Proposal details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">{detailsBody}</CardContent>
      </Card>

      <ProposalShareSettings
        proposalId={proposal.id}
        hasPassword={Boolean(proposal.sharePasswordHash)}
      />
    </div>
  );
}
