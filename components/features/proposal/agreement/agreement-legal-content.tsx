import { ProposalRichTextHtml } from "@/components/shared/proposal-rich-text-html";
import { Typography } from "@/components/ui/typography";
import { DEFAULT_AGREEMENT_LEGAL_SECTIONS } from "@/lib/proposal/agreement/default-legal-sections";
import {
  AGREEMENT_PRINT_LEGAL_BODY_ATTR,
  AGREEMENT_PRINT_LEGAL_SECTIONS_ATTR,
} from "@/lib/proposal/agreement/print-layout";

export { DEFAULT_AGREEMENT_LEGAL_SECTIONS, defaultAgreementLegalNavItems } from "@/lib/proposal/agreement/default-legal-sections";

export interface AgreementLegalContentProps {
  legalHtml?: string;
}

export function AgreementLegalContent({ legalHtml }: AgreementLegalContentProps) {
  const customLegal = legalHtml?.trim();

  if (customLegal) {
    return (
      <div {...{ [AGREEMENT_PRINT_LEGAL_BODY_ATTR]: "" }}>
        <ProposalRichTextHtml html={customLegal} tone="muted" layout="body" />
      </div>
    );
  }

  return (
    <div {...{ [AGREEMENT_PRINT_LEGAL_SECTIONS_ATTR]: "" }} className="space-y-8">
      {DEFAULT_AGREEMENT_LEGAL_SECTIONS.map((s, i) => (
        <section key={s.heading} id={`agreement-section-${i}`} className="space-y-2">
          <Typography variant="h3">{s.heading}</Typography>
          <Typography className="text-sm leading-relaxed text-muted-foreground">{s.body}</Typography>
        </section>
      ))}
    </div>
  );
}
