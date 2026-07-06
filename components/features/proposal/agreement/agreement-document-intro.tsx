import { ProposalRichTextHtml } from "@/components/shared/proposal-rich-text-html";

export interface AgreementDocumentIntroProps {
  introHtml?: string;
}

export function AgreementDocumentIntro({ introHtml }: AgreementDocumentIntroProps) {
  const intro = introHtml?.trim();
  if (!intro) return null;

  return (
    <section className="mx-auto mt-10 max-w-2xl">
      <ProposalRichTextHtml html={intro} tone="muted" layout="body" />
    </section>
  );
}
