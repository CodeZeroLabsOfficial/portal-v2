import { AgreementDocumentTitle } from "@/components/features/proposal/agreement/agreement-document-title";
import { AGREEMENT_TITLE_PAGE_SCREEN_CLASSES } from "@/lib/proposal/agreement/print-layout";
import { AGREEMENT_MODAL_LIGHT_SURFACE_CLASSES } from "@/lib/proposal/editor-surface-tokens";
import { cn } from "@/lib/utils";

export interface ContractTemplateCoverTitlePageProps {
  agreementTitle: string;
  className?: string;
}

/** Hub card cover — agreement PDF page 1 (centered document title only). */
export function ContractTemplateCoverTitlePage({
  agreementTitle,
  className,
}: ContractTemplateCoverTitlePageProps) {
  const title = agreementTitle.trim() || "Services Agreement";

  return (
    <div
      className={cn(
        AGREEMENT_TITLE_PAGE_SCREEN_CLASSES,
        AGREEMENT_MODAL_LIGHT_SURFACE_CLASSES,
        className,
      )}
    >
      <AgreementDocumentTitle
        title={title}
        className="px-6 [&_h1]:text-balance [&_h1]:text-2xl [&_h1]:leading-tight [&_h1]:sm:text-3xl"
      />
    </div>
  );
}
