import { AgreementDocumentIntro } from "@/components/features/proposal/agreement/agreement-document-intro";
import { AgreementSectionLabel } from "@/components/features/proposal/agreement/agreement-section-label";
import { ProposalRichTextHtml } from "@/components/shared/proposal-rich-text-html";
import type { ProposalRichTextTone } from "@/lib/proposal/rich-text/display-typography";

export interface AgreementDocumentBodyProps {
  introHtml?: string;
  legalHtml?: string;
  legalEmptyFallback?: React.ReactNode;
  /** Buyer modal uses muted body copy; staff preview matches the editor with default. */
  contentTone?: ProposalRichTextTone;
}

/** Intro + legal rich-text zones only — agreement chrome wraps this. */
export function AgreementDocumentBody({
  introHtml,
  legalHtml,
  legalEmptyFallback,
  contentTone = "muted",
}: AgreementDocumentBodyProps) {
  const legal = legalHtml?.trim();

  return (
    <>
      <AgreementDocumentIntro introHtml={introHtml} contentTone={contentTone} />

      <section className="mt-12">
        <AgreementSectionLabel>The agreement</AgreementSectionLabel>
        <div className="mt-6">
          {legal ? (
            <ProposalRichTextHtml html={legal} tone={contentTone} layout="body" />
          ) : (
            legalEmptyFallback
          )}
        </div>
      </section>
    </>
  );
}
