import { AgreementSectionLabel } from "@/components/features/proposal/agreement/agreement-section-label";
import { PackageSummaryCard } from "@/components/features/proposal/agreement/package-summary-card";
import { Card, CardContent } from "@/components/ui/card";
import { AGREEMENT_PRINT_EXCLUDE_ATTR } from "@/hooks/use-agreement-print-mode";
import { AGREEMENT_PLAN_SECTION_ID } from "@/lib/proposal/agreement/modal-layout";
import type { PackageSelectionSummary } from "@/lib/proposal/agreement/package-selection-summary";

export interface AgreementSelectionSectionProps {
  summaries: PackageSelectionSummary[];
}

/** Buyer agreement modal — “Your selection” plan cards (screen only). */
export function AgreementSelectionSection({ summaries }: AgreementSelectionSectionProps) {
  if (summaries.length === 0) return null;

  return (
    <section
      id={AGREEMENT_PLAN_SECTION_ID}
      {...{ [AGREEMENT_PRINT_EXCLUDE_ATTR]: "" }}
      className="mt-12 space-y-4 print:hidden"
    >
      <AgreementSectionLabel>Your selection</AgreementSectionLabel>
      <div className="space-y-4">
        {summaries.map((summary) => (
          <PackageSummaryCard key={summary.blockId} summary={summary} />
        ))}
      </div>
    </section>
  );
}

export function NoPackageSelectionCard() {
  return (
    <section
      {...{ [AGREEMENT_PRINT_EXCLUDE_ATTR]: "" }}
      className="mt-12 space-y-2 print:hidden"
    >
      <Card className="rounded-2xl border-dashed border-zinc-200 bg-zinc-50 py-5 shadow-none">
        <CardContent className="text-sm text-zinc-500">
          No plan selected yet. Choose a plan in the proposal above before signing — your selection will appear
          here automatically.
        </CardContent>
      </Card>
    </section>
  );
}
