import Link from "next/link";
import { FileText } from "lucide-react";

import { ProposalShareSettings } from "@/components/features/proposal/proposal-share-settings";
import { PropertyField, propertyMutedText } from "@/components/shared/property-field";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyAmount } from "@/lib/common/format";
import {
  isDocumentPackageSelectionComplete,
  listPackagesBlocksInDocument,
} from "@/lib/proposal/commerce/package-selection";
import { computeProposalDealValue } from "@/lib/proposal/commerce/packages-totals";
import { getProposalStageBadgeDisplay } from "@/lib/proposal/status-badge";
import type { ProposalRecord } from "@/types/proposal";

export interface ProposalPropertiesPanelProps {
  proposal: ProposalRecord;
  recipientDisplayName: string | null;
  customerId: string | null;
  templateName: string | null;
  sourceTemplateId: string | null;
  /** Sidebar inspector: flat layout without cards or share settings. */
  variant?: "page" | "inspector";
}

export function ProposalPropertiesPanel({
  proposal,
  recipientDisplayName,
  customerId,
  templateName,
  sourceTemplateId,
  variant = "page",
}: ProposalPropertiesPanelProps) {
  const stage = getProposalStageBadgeDisplay(proposal);
  const hasPackagesBlocks = listPackagesBlocksInDocument(proposal.document.blocks).length > 0;
  const packageSelectionComplete = isDocumentPackageSelectionComplete(
    proposal.document.blocks,
    proposal.publicSelections,
  );
  const dealValue =
    !hasPackagesBlocks || packageSelectionComplete
      ? computeProposalDealValue(proposal.document.blocks, proposal.publicSelections)
      : null;

  const detailsBody = (
    <div className="space-y-6">
      <PropertyField label="Recipient">
        {customerId && recipientDisplayName ? (
          <p className="text-muted-foreground text-sm">
            <Link href={`/admin/customers/${customerId}`} className="underline-offset-4 hover:underline">
              {recipientDisplayName}
            </Link>
          </p>
        ) : proposal.recipientEmail?.trim() ? (
          propertyMutedText(proposal.recipientEmail)
        ) : (
          propertyMutedText(undefined)
        )}
      </PropertyField>

      <PropertyField label="Status">
        <StatusBadge label={stage.label} variant={stage.variant} title={stage.title} />
      </PropertyField>

      <PropertyField label="Public opens">
        <p className="text-muted-foreground text-sm">
          {typeof proposal.viewCount === "number" ? proposal.viewCount : "Not recorded"}
        </p>
      </PropertyField>

      <PropertyField label="Approx. engagement">
        <p className="text-muted-foreground text-sm">
          {typeof proposal.totalEngagementSeconds === "number" ? (
            <>{Math.max(0, Math.round(proposal.totalEngagementSeconds / 60))} minutes on page</>
          ) : (
            "Not recorded"
          )}
        </p>
      </PropertyField>

      <PropertyField label="Value">
        {dealValue ? (
          <p className="text-sm">
            <span className="font-medium tabular-nums">
              {formatCurrencyAmount(dealValue.totalMinor, dealValue.currency)}
            </span>
          </p>
        ) : hasPackagesBlocks ? (
          <p className="text-muted-foreground text-sm">No selection</p>
        ) : (
          propertyMutedText(undefined)
        )}
      </PropertyField>

      <PropertyField label="Template">
        {sourceTemplateId ? (
          <p className="text-muted-foreground text-sm">
            <Link
              href={`/admin/templates/${sourceTemplateId}`}
              className="underline-offset-4 hover:underline"
            >
              {templateName ?? "Untitled template"}
            </Link>
          </p>
        ) : (
          propertyMutedText(undefined)
        )}
      </PropertyField>
    </div>
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
