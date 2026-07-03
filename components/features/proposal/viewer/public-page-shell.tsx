import type { ReactNode } from "react";

import {
  PROPOSAL_PUBLIC_CONTENT_CLASSES,
  PROPOSAL_PUBLIC_DOCUMENT_OUTER_CLASSES,
  PROPOSAL_PUBLIC_FOOTER_SECTION_CLASSES,
  PROPOSAL_PUBLIC_GATE_WRAPPER_CLASSES,
  proposalPublicMainClasses,
} from "@/lib/proposal/public/public-layout";

export interface ProposalPublicPageShellProps {
  locked: boolean;
  flushBottom?: boolean;
  document: ReactNode;
  footer?: ReactNode;
  analytics?: ReactNode;
}

/**
 * Layout shell for `/p/[token]` — password gate, document body, and optional acceptance footer.
 * Acceptance logic stays in child components; this only handles spacing and columns.
 */
export function ProposalPublicPageShell({
  locked,
  flushBottom = false,
  document,
  footer,
  analytics,
}: ProposalPublicPageShellProps) {
  return (
    <main className={proposalPublicMainClasses({ locked, flushBottom })}>
      {locked ? (
        <div className={PROPOSAL_PUBLIC_CONTENT_CLASSES}>
          <div className={PROPOSAL_PUBLIC_GATE_WRAPPER_CLASSES}>{document}</div>
        </div>
      ) : (
        <>
          {analytics}
          <div className={PROPOSAL_PUBLIC_DOCUMENT_OUTER_CLASSES}>{document}</div>
          {footer ? (
            <div className={`${PROPOSAL_PUBLIC_CONTENT_CLASSES} ${PROPOSAL_PUBLIC_FOOTER_SECTION_CLASSES}`}>
              {footer}
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
