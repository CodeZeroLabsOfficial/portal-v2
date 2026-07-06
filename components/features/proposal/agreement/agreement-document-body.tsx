import { AgreementDocumentIntro } from "@/components/features/proposal/agreement/agreement-document-intro";
import { AgreementSectionLabel } from "@/components/features/proposal/agreement/agreement-section-label";
import { ProposalRichTextHtml } from "@/components/shared/proposal-rich-text-html";

export interface AgreementDocumentBodyProps {
  introHtml?: string;
  legalHtml?: string;
  legalEmptyFallback?: React.ReactNode;
}

/** Intro + legal rich-text zones only — agreement chrome wraps this. */
export function AgreementDocumentBody({
  introHtml,
  legalHtml,
  legalEmptyFallback,
}: AgreementDocumentBodyProps) {
  const legal = legalHtml?.trim();

  return (
    <>
      <AgreementDocumentIntro introHtml={introHtml} />

      <section className="mt-12">
        <AgreementSectionLabel>The agreement</AgreementSectionLabel>
        <div className="mt-6">
          {legal ? (
            <ProposalRichTextHtml html={legal} tone="muted" layout="body" />
          ) : (
            legalEmptyFallback
          )}
        </div>
      </section>
    </>
  );
}
