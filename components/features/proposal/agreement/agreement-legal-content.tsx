import { ProposalRichTextHtml } from "@/components/shared/proposal-rich-text-html";
import { Typography } from "@/components/ui/typography";
import {
  agreementLegalHtmlUsesSectionTags,
  splitAgreementLegalHtml,
} from "@/lib/agreement/split-legal-html";
import {
  AGREEMENT_PRINT_FIRST_LEGAL_BLOCK_ATTR,
  AGREEMENT_PRINT_FIRST_LEGAL_BLOCK_CLASSES,
  AGREEMENT_PRINT_LEGAL_BODY_ATTR,
  AGREEMENT_PRINT_LEGAL_SECTIONS_ATTR,
} from "@/lib/proposal/agreement/print-layout";
import { cn } from "@/lib/utils";

/** Placeholder body when the editor has not supplied custom legal text. */
export const DEFAULT_AGREEMENT_LEGAL_SECTIONS: Array<{ heading: string; body: string }> = [
  {
    heading: "1. Parties",
    body: "This Services Agreement (this “Agreement”) is entered into between the service provider issuing this proposal (the “Provider”) and the customer identified on the proposal cover (the “Client”). Capitalised terms used herein have the meanings ascribed to them throughout this document.",
  },
  {
    heading: "2. Scope of Services",
    body: "The Provider agrees to deliver the products, services, and deliverables described in the proposal above, including any selected plan, add-ons, and statements of work. Changes to the scope require written agreement from both parties.",
  },
  {
    heading: "3. Pricing & Payment",
    body: "Fees are payable in the amounts and on the schedule described in the proposal, including any monthly recurring subscription fees and one-time upfront amounts. Invoices are due within fourteen (14) days of issue unless otherwise specified. Overdue amounts may accrue interest at the lesser of 1.5% per month or the maximum rate permitted by law.",
  },
  {
    heading: "4. Term",
    body: "The initial term begins on the date this Agreement is signed by the Client and continues for the commitment period selected in the proposal. The Agreement renews automatically for successive periods of the same length unless either party gives written notice of non-renewal at least thirty (30) days prior to the end of the then-current term.",
  },
  {
    heading: "5. Termination",
    body: "Either party may terminate this Agreement for material breach if the other party fails to cure such breach within thirty (30) days of written notice. Upon termination, the Client remains responsible for all fees accrued through the effective date of termination.",
  },
  {
    heading: "6. Confidentiality",
    body: "Each party will treat the other party's non-public information as confidential and use it solely to perform its obligations under this Agreement. This obligation survives termination for a period of three (3) years.",
  },
  {
    heading: "7. Warranties & Liability",
    body: "The services are provided on an “as is” basis except where expressly warranted in the proposal. Neither party will be liable for indirect, incidental, or consequential damages. Each party's aggregate liability arising out of this Agreement will not exceed the fees paid by the Client in the twelve (12) months preceding the claim.",
  },
  {
    heading: "8. Governing Law",
    body: "This Agreement is governed by the laws of the jurisdiction in which the Provider is established, without regard to its conflict of laws principles. The parties consent to the exclusive jurisdiction of the courts in that jurisdiction for any dispute arising out of this Agreement.",
  },
];

/** Sidebar jump links when no custom legal HTML is stored on the agreement block. */
export function defaultAgreementLegalNavItems(): Array<{ id: string; label: string }> {
  return DEFAULT_AGREEMENT_LEGAL_SECTIONS.map((s, i) => ({
    id: `agreement-section-${i}`,
    label: s.heading,
  }));
}

export interface AgreementLegalContentProps {
  legalHtml?: string;
}

export function AgreementLegalContent({ legalHtml }: AgreementLegalContentProps) {
  const customLegal = legalHtml?.trim();

  if (customLegal) {
    if (agreementLegalHtmlUsesSectionTags(customLegal)) {
      return (
        <div {...{ [AGREEMENT_PRINT_LEGAL_BODY_ATTR]: "" }}>
          <ProposalRichTextHtml html={customLegal} tone="muted" layout="body" />
        </div>
      );
    }

    const { firstBlockHtml, remainderHtml } = splitAgreementLegalHtml(customLegal);

    return (
      <div {...{ [AGREEMENT_PRINT_LEGAL_BODY_ATTR]: "" }}>
        <div
          {...{ [AGREEMENT_PRINT_FIRST_LEGAL_BLOCK_ATTR]: "" }}
          className={AGREEMENT_PRINT_FIRST_LEGAL_BLOCK_CLASSES}
        >
          <ProposalRichTextHtml html={firstBlockHtml} tone="muted" layout="body" />
        </div>
        {remainderHtml ? (
          <ProposalRichTextHtml html={remainderHtml} tone="muted" layout="body" />
        ) : null}
      </div>
    );
  }

  return (
    <div {...{ [AGREEMENT_PRINT_LEGAL_SECTIONS_ATTR]: "" }} className="space-y-8">
      {DEFAULT_AGREEMENT_LEGAL_SECTIONS.map((s, i) => (
        <section
          key={s.heading}
          id={`agreement-section-${i}`}
          className={cn("space-y-2", i === 0 && AGREEMENT_PRINT_FIRST_LEGAL_BLOCK_CLASSES)}
          {...(i === 0 ? { [AGREEMENT_PRINT_FIRST_LEGAL_BLOCK_ATTR]: "" } : {})}
        >
          <Typography variant="h3">{s.heading}</Typography>
          <Typography className="text-sm leading-relaxed text-muted-foreground">{s.body}</Typography>
        </section>
      ))}
    </div>
  );
}
