import { AGREEMENT_PRINT_FOOTER_ATTR } from "@/lib/proposal/agreement/print-layout";

export interface AgreementPrintFooterProps {
  companyName?: string;
}

/** Repeating print footer — Settings → Company name (replaces browser URL when headers are off). */
export function AgreementPrintFooter({ companyName }: AgreementPrintFooterProps) {
  const label = companyName?.trim();
  if (!label) return null;

  return (
    <footer
      {...{ [AGREEMENT_PRINT_FOOTER_ATTR]: "" }}
      className="hidden print:block"
      aria-hidden
    >
      {label}
    </footer>
  );
}
