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

function formatSignatureMethodLabel(
  method: SignedAgreementRecord["signatureMethod"],
): string | null {
  switch (method) {
    case "draw":
      return "Drawn";
    case "type":
      return "Typed";
    case "upload":
      return "Uploaded";
    default:
      return null;
  }
}

/** Staff CRM — signing details + plan summary in one card (screen only). */
export function SignedAgreementSummaryCard({ record }: SignedAgreementSummaryCardProps) {
  const signedLabel = formatSignedAt(record.signedAt);
  const signatureMethodLabel = formatSignatureMethodLabel(record.signatureMethod);
  const signerName = record.signerName?.trim() || null;
  const signerOrganization = record.signerOrganization?.trim() || null;
  const packageSummaries = packageSummariesFromSignedRecord(record);
  const hasSignedBy = Boolean(signerName);
  const hasDateSigned = Boolean(signedLabel);
  const hasSigningDetails = hasSignedBy || hasDateSigned;
  const hasPlanContent = packageSummaries.length > 0;

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-zinc-200 bg-white py-0 shadow-sm">
      <CardContent className="space-y-5 p-5">
        {hasSigningDetails ? (
          <div className="space-y-5">
            {hasSignedBy ? (
              <div>
                <AgreementSectionLabel>Signed By</AgreementSectionLabel>
                <p className="mt-1 text-sm text-zinc-900">{signerName}</p>
                {signerOrganization ? (
                  <p className="text-sm text-zinc-500">{signerOrganization}</p>
                ) : null}
              </div>
            ) : null}

            {hasDateSigned ? (
              <div>
                <AgreementSectionLabel>Date Signed</AgreementSectionLabel>
                <p className="mt-1 text-sm text-zinc-900">{signedLabel}</p>
                {signatureMethodLabel ? (
                  <p className="text-sm text-zinc-500">{signatureMethodLabel}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {hasPlanContent ? (
          packageSummaries.map((summary, index) => (
            <PackageSummaryCardBody
              key={summary.blockId}
              summary={summary}
              className={index > 0 || hasSigningDetails ? "border-t border-zinc-200 pt-5" : undefined}
            />
          ))
        ) : (
          <div className={hasSigningDetails ? "border-t border-zinc-200 pt-5" : undefined}>
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
