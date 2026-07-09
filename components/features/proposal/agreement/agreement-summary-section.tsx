import { AgreementSectionLabel } from "@/components/features/proposal/agreement/agreement-section-label";
import { SignedAgreementSummaryCard } from "@/components/features/proposal/agreement/signed-agreement-summary-card";
import { AGREEMENT_PRINT_EXCLUDE_ATTR } from "@/hooks/use-agreement-print-mode";
import { AGREEMENT_SUMMARY_SECTION_ID } from "@/lib/proposal/agreement/modal-layout";
import type { SignedAgreementRecord } from "@/types/signed-agreement";

export interface AgreementSummarySectionProps {
  record: SignedAgreementRecord;
}

/** Staff CRM — Agreement summary (screen only). */
export function AgreementSummarySection({ record }: AgreementSummarySectionProps) {
  return (
    <section
      id={AGREEMENT_SUMMARY_SECTION_ID}
      {...{ [AGREEMENT_PRINT_EXCLUDE_ATTR]: "" }}
      className="mt-12 space-y-4 print:hidden"
    >
      <AgreementSectionLabel>Agreement summary</AgreementSectionLabel>
      <SignedAgreementSummaryCard record={record} />
    </section>
  );
}
