import { PROPOSAL_PUBLIC_META_LABEL_CLASSES } from "@/lib/proposal/public/public-typography";
import { cn } from "@/lib/utils";

export interface AgreementSectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

/** Section meta label — Jump to, The agreement, Signature, etc. */
export function AgreementSectionLabel({ children, className }: AgreementSectionLabelProps) {
  return <p className={cn(PROPOSAL_PUBLIC_META_LABEL_CLASSES, className)}>{children}</p>;
}
