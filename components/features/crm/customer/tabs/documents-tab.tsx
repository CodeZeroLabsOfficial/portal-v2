"use client";

import * as React from "react";
import { FolderOpen } from "lucide-react";
import { toast } from "sonner";

import { CustomerDocumentCard } from "@/components/features/crm/customer/customer-document-card";
import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { CustomerTabSectionCard } from "@/components/features/crm/customer/customer-tab-section-card";
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
      signedAgreementId: doc.id,
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

  return (
    <>
      <CustomerTabSectionCard title="Documents">
        {signedAgreements.length === 0 ? (
          <CustomerTabEmptyState icon={FolderOpen} embedded>
            <p>
              Signed Services Agreements will appear here when a customer completes signing on a
              linked proposal.
            </p>
          </CustomerTabEmptyState>
        ) : (
          signedAgreements.map((doc) => (
            <CustomerDocumentCard
              key={doc.id}
              doc={doc}
              loading={loadingId === doc.id}
              onView={(d) => void openSignedAgreementModal(d)}
            />
          ))
        )}
      </CustomerTabSectionCard>

      <SignedAgreementDialog open={modalOpen} onOpenChange={onModalOpenChange} data={modalData} />
    </>
  );
}
