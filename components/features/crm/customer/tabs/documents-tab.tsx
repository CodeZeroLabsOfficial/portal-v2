"use client";

import * as React from "react";
import { Clock, ExternalLink, Eye, FolderOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getSignedAgreementModalPayloadAction } from "@/server/actions/customers-crm";
import type { CustomerRecord } from "@/types/customer";
import type { SignedAgreementRecord } from "@/types/signed-agreement";

import { SignedAgreementDialog } from "../signed-agreement-dialog";

export interface CustomerDocumentsTabProps {
  customer: CustomerRecord;
  signedAgreements: SignedAgreementRecord[];
}

export function CustomerDocumentsTab({ customer, signedAgreements }: CustomerDocumentsTabProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [modalData, setModalData] = React.useState<{
    record: SignedAgreementRecord;
    signatureSrc: string | null;
  } | null>(null);

  async function openSignedAgreementModal(doc: SignedAgreementRecord) {
    setLoadingId(doc.id);
    setModalData(null);
    const res = await getSignedAgreementModalPayloadAction({
      customerId: customer.id,
      signedAgreementId: doc.id
    });
    setLoadingId(null);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    setModalData({ record: res.record, signatureSrc: res.signatureSrc });
    setModalOpen(true);
  }

  function onModalOpenChange(next: boolean) {
    setModalOpen(next);
    if (!next) {
      setModalData(null);
    }
  }

  if (signedAgreements.length === 0) {
    return (
      <CustomerTabEmptyState icon={FolderOpen}>
        <p>
          Signed Services Agreements will appear here when a customer completes signing on a linked
          proposal.
        </p>
      </CustomerTabEmptyState>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {signedAgreements.map((doc) => {
          const signedLabel =
            doc.signedAt > 0
              ? new Date(doc.signedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short"
                })
              : "—";

          return (
            <li
              key={doc.id}
              className="border-border/60 bg-card/50 flex flex-col gap-3 rounded-xl border px-4 py-3">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <p className="min-w-0 flex-1 font-medium text-foreground">{doc.proposalTitle}</p>
                <div className="text-muted-foreground flex shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-1 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
                    <span className="text-foreground/90">{signedLabel}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
                    <span className="text-foreground/90">{doc.signerName}</span>
                  </span>
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
                  <StatusBadge label="Signed" variant="success" />
                  <span className="text-muted-foreground text-xs">
                    {doc.totalAmount.formatted}/mo total · {doc.selectedPlan}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 sm:ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={loadingId === doc.id}
                    aria-label={`View signed agreement “${doc.proposalTitle}”`}
                    onClick={() => void openSignedAgreementModal(doc)}>
                    {loadingId === doc.id ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <ExternalLink className="size-4" aria-hidden />
                    )}
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <SignedAgreementDialog open={modalOpen} onOpenChange={onModalOpenChange} data={modalData} />
    </>
  );
}
