import { ProposalRichTextHtml } from "@/components/shared/proposal-rich-text-html";
import type { ProposalRichTextTone } from "@/lib/proposal/rich-text/display-typography";

export interface AgreementDocumentIntroProps {
  introHtml?: string;
  /** Buyer modal uses muted intro; staff preview matches the editor with default. */
  contentTone?: ProposalRichTextTone;
}

export function AgreementDocumentIntro({
  introHtml,
  contentTone = "muted",
}: AgreementDocumentIntroProps) {
  const intro = introHtml?.trim();
  if (!intro) return null;

  return (
    <section className="mx-auto mt-10 max-w-2xl">
      <ProposalRichTextHtml html={intro} tone={contentTone} layout="body" />
    </section>
  );
}
