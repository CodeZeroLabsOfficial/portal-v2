import { PROPOSAL_PUBLIC_META_LABEL_CLASSES } from "@/lib/proposal/public/public-typography";

export interface AgreementSectionLabelProps {
  children: React.ReactNode;
}

/** Section meta label — Jump to, The agreement, Signature, etc. */
export function AgreementSectionLabel({ children }: AgreementSectionLabelProps) {
  return <p className={PROPOSAL_PUBLIC_META_LABEL_CLASSES}>{children}</p>;
}
