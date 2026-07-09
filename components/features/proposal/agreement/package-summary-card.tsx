import { Card, CardContent } from "@/components/ui/card";
import { AgreementSectionLabel } from "@/components/features/proposal/agreement/agreement-section-label";
import { formatCurrencyAmount } from "@/lib/common/format";
import type { PackageSelectionSummary } from "@/lib/proposal/agreement/package-selection-summary";
import { cn } from "@/lib/utils";

export interface PackageSummaryCardBodyProps {
  summary: PackageSelectionSummary;
  className?: string;
}

/** Plan + add-on summary body — used inside cards and combined staff summary. */
export function PackageSummaryCardBody({ summary, className }: PackageSummaryCardBodyProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <AgreementSectionLabel>{summary.blockTitle}</AgreementSectionLabel>
          <p className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">{summary.tierName}</p>
          {summary.termLabel ? (
            <p className="text-sm text-zinc-500">Term: {summary.termLabel}</p>
          ) : null}
        </div>
        <div className="text-right">
          <AgreementSectionLabel>Monthly subscription</AgreementSectionLabel>
          <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900">
            {formatCurrencyAmount(summary.monthlyMinor, summary.currency)}
          </p>
        </div>
      </div>

      {summary.addonLines.length > 0 ? (
        <div className="border-t border-zinc-200 pt-4">
          <AgreementSectionLabel>Add-ons</AgreementSectionLabel>
          <ul className="mt-2 space-y-2">
            {summary.addonLines.map((line) => (
              <li
                key={line.id}
                className="flex items-baseline justify-between gap-3 text-sm text-zinc-900"
              >
                <span>
                  {line.label}
                  {line.quantity > 1 ? (
                    <span className="text-zinc-500"> × {line.quantity}</span>
                  ) : null}
                </span>
                <span className="tabular-nums text-zinc-900">
                  {formatCurrencyAmount(line.lineTotalMinor, summary.currency)}
                  {line.billingKind === "one_off" ? (
                    <span className="text-zinc-500"> one-time</span>
                  ) : (
                    <span className="text-zinc-500">/mo</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {summary.upfrontMinor > 0 ? (
        <div className="flex items-baseline justify-between border-t border-zinc-200 pt-4 text-sm">
          <span className="font-medium text-zinc-900">Upfront fee</span>
          <span className="tabular-nums font-semibold text-zinc-900">
            {formatCurrencyAmount(summary.upfrontMinor, summary.currency)}
            <span className="font-normal text-zinc-500"> one-time</span>
          </span>
        </div>
      ) : null}

      <div className="flex items-baseline justify-between rounded-xl bg-zinc-100 px-4 py-3">
        <span className="text-sm font-semibold text-zinc-900">Monthly subscription</span>
        <span className="text-lg font-semibold tabular-nums text-zinc-900">
          {formatCurrencyAmount(summary.monthlyTotalMinor, summary.currency)}
        </span>
      </div>
      {summary.oneOffAddonsMinor > 0 ? (
        <p className="!mt-2 text-right text-xs text-zinc-500">
          Plus {formatCurrencyAmount(summary.oneOffAddonsMinor, summary.currency)} in one-time add-ons due at
          signing.
        </p>
      ) : null}
    </div>
  );
}

export interface PackageSummaryCardProps {
  summary: PackageSelectionSummary;
}

/** Plan + add-on summary card — buyer “Your selection”. */
export function PackageSummaryCard({ summary }: PackageSummaryCardProps) {
  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-zinc-200 bg-white py-0 shadow-sm">
      <CardContent className="p-5">
        <PackageSummaryCardBody summary={summary} />
      </CardContent>
    </Card>
  );
}
