"use client";

import { ExternalLink, Loader2 } from "lucide-react";

import { CustomerDetailListRow } from "@/components/features/crm/customer/customer-detail-list-row";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { documentSignedLabel } from "@/lib/crm/customer-tab-labels";
import type { SignedAgreementRecord } from "@/types/signed-agreement";

export interface CustomerDocumentCardProps {
  doc: SignedAgreementRecord;
  loading?: boolean;
  onView: (doc: SignedAgreementRecord) => void;
}

export function CustomerDocumentCard({ doc, loading = false, onView }: CustomerDocumentCardProps) {
  return (
    <CustomerDetailListRow
      title={doc.proposalTitle}
      dateLabel={documentSignedLabel(doc.signedAt)}
      badge={<StatusBadge label="Signed" variant="success" />}
      meta={doc.signerName}
      action={
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0"
          disabled={loading}
          aria-label={`View signed agreement “${doc.proposalTitle}”`}
          onClick={() => onView(doc)}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ExternalLink className="size-4" aria-hidden />
          )}
        </Button>
      }
    />
  );
}
