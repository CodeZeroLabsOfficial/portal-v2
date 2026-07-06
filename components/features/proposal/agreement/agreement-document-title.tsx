import { AGREEMENT_DOCUMENT_TITLE_CLASSES } from "@/lib/proposal/agreement/chrome-typography";
import { cn } from "@/lib/utils";

export interface AgreementDocumentTitleProps {
  title: string;
  className?: string;
}

/** Fixed serif hero title — outside `.proposal-rich-text` content zones. */
export function AgreementDocumentTitle({ title, className }: AgreementDocumentTitleProps) {
  return (
    <header className={cn("text-center", className)}>
      <h1 className={AGREEMENT_DOCUMENT_TITLE_CLASSES}>{title}</h1>
    </header>
  );
}
