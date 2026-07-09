import { AgreementSectionLabel } from "@/components/features/proposal/agreement/agreement-section-label";
import { PackageSummaryCard } from "@/components/features/proposal/agreement/package-summary-card";
import { Typography } from "@/components/ui/typography";
import { AGREEMENT_PRINT_EXCLUDE_ATTR } from "@/hooks/use-agreement-print-mode";
import { packageSummariesFromSignedRecord } from "@/lib/proposal/agreement/signed-record-package-summaries";
import type { SignedAgreementRecord } from "@/types/signed-agreement";

export interface AgreementSummarySectionProps {
  record: SignedAgreementRecord;
}

function formatSignedMetaLine(record: SignedAgreementRecord): string {
  const parts: string[] = [];

  if (record.signedAt > 0) {
    parts.push(
      `Signed ${new Date(record.signedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })}`,
    );
  }

  if (record.signerName?.trim()) {
    parts.push(`Signer: ${record.signerName.trim()}`);
  }
  if (record.signerEmail?.trim()) {
    parts.push(`Email: ${record.signerEmail.trim()}`);
  }
  if (record.signerOrganization?.trim()) {
    parts.push(`Org: ${record.signerOrganization.trim()}`);
  }

  return parts.join(" · ");
}

/** Staff CRM — signing metadata + buyer-style plan cards (screen only). */
export function AgreementSummarySection({ record }: AgreementSummarySectionProps) {
  const metaLine = formatSignedMetaLine(record);
  const packageSummaries = packageSummariesFromSignedRecord(record);

  return (
    <section
      {...{ [AGREEMENT_PRINT_EXCLUDE_ATTR]: "" }}
      className="mt-12 space-y-4 print:hidden"
    >
      <AgreementSectionLabel>Agreement summary</AgreementSectionLabel>

      {metaLine ? (
        <Typography variant="muted" className="text-sm leading-relaxed">
          {metaLine}
        </Typography>
      ) : null}

      {packageSummaries.length > 0 ? (
        <div className="space-y-4">
          {packageSummaries.map((summary) => (
            <PackageSummaryCard key={summary.blockId} summary={summary} />
          ))}
        </div>
      ) : (
        <Typography variant="muted" className="text-sm">
          {record.selectedPlan?.trim() || "No package selection recorded."}
          {record.totalAmount.formatted ? (
            <>
              {" "}
              · Monthly total: {record.totalAmount.formatted}
            </>
          ) : null}
        </Typography>
      )}
    </section>
  );
}
