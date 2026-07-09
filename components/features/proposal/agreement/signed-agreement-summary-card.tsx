import { Card, CardContent } from "@/components/ui/card";
import { AgreementSectionLabel } from "@/components/features/proposal/agreement/agreement-section-label";
import { PackageSummaryCardBody } from "@/components/features/proposal/agreement/package-summary-card";
import { Typography } from "@/components/ui/typography";
import { packageSummariesFromSignedRecord } from "@/lib/proposal/agreement/signed-record-package-summaries";
import type { SignedAgreementRecord } from "@/types/signed-agreement";

export interface SignedAgreementSummaryCardProps {
  record: SignedAgreementRecord;
}

function formatSignedAt(signedAt: number): string | null {
  if (signedAt <= 0) return null;
  return new Date(signedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Staff CRM — signing details + plan summary in one card (screen only). */
export function SignedAgreementSummaryCard({ record }: SignedAgreementSummaryCardProps) {
  const signedLabel = formatSignedAt(record.signedAt);
  const packageSummaries = packageSummariesFromSignedRecord(record);
  const hasSigningDetails =
    signedLabel || record.signerName?.trim() || record.signerEmail?.trim();
  const hasPlanContent = packageSummaries.length > 0;

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-zinc-200 bg-white py-0 shadow-sm">
      <CardContent className="space-y-5 p-5">
        {hasSigningDetails ? (
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-4">
            {signedLabel ? (
              <div>
                <AgreementSectionLabel>Signed</AgreementSectionLabel>
                <p className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">{signedLabel}</p>
              </div>
            ) : null}
            {record.signerName?.trim() ? (
              <div className={signedLabel ? "text-right sm:text-left" : undefined}>
                <AgreementSectionLabel>Signer</AgreementSectionLabel>
                <p className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
                  {record.signerName.trim()}
                </p>
                {record.signerOrganization?.trim() ? (
                  <p className="text-sm text-zinc-500">{record.signerOrganization.trim()}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {record.signerEmail?.trim() ? (
          <div>
            <AgreementSectionLabel>Email</AgreementSectionLabel>
            <p className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 break-all">
              {record.signerEmail.trim()}
            </p>
          </div>
        ) : null}

        {hasPlanContent ? (
          packageSummaries.map((summary, index) => (
            <PackageSummaryCardBody
              key={summary.blockId}
              summary={summary}
              className={index > 0 || hasSigningDetails || record.signerEmail?.trim() ? "border-t border-zinc-200 pt-5" : undefined}
            />
          ))
        ) : (
          <div
            className={
              hasSigningDetails || record.signerEmail?.trim()
                ? "border-t border-zinc-200 pt-5"
                : undefined
            }>
            <Typography variant="muted" className="text-sm">
              {record.selectedPlan?.trim() || "No package selection recorded."}
            </Typography>
            {record.totalAmount.formatted ? (
              <div className="mt-4 flex items-baseline justify-between rounded-xl bg-zinc-100 px-4 py-3">
                <span className="text-sm font-semibold text-zinc-900">Monthly subscription</span>
                <span className="text-lg font-semibold tabular-nums text-zinc-900">
                  {record.totalAmount.formatted}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
