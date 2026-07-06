"use client";

import * as React from "react";
import { AgreementDocumentBody } from "@/components/features/proposal/agreement/agreement-document-body";
import { AgreementDocumentTitle } from "@/components/features/proposal/agreement/agreement-document-title";
import { contractTemplateDocumentToHtml } from "@/lib/contract-template/document";
import type { ProposalDocument } from "@/types/proposal";

export function ContractTemplateAgreementPreview({
  agreementTitle,
  document,
}: {
  agreementTitle: string;
  document: ProposalDocument;
}) {
  const { introHtml, legalHtml } = React.useMemo(
    () => contractTemplateDocumentToHtml(document),
    [document],
  );

  const title = agreementTitle.trim() || "Services Agreement";

  return (
    <div className="mx-auto w-full max-w-6xl bg-white px-5 py-12 sm:px-10 sm:py-16">
      <AgreementDocumentTitle title={title} />
      <p className="mt-3 text-center text-sm font-medium text-zinc-500">
        Live preview — buyer agreement modal
      </p>

      <AgreementDocumentBody
        introHtml={introHtml}
        legalHtml={legalHtml}
        legalEmptyFallback={
          <p className="text-sm text-zinc-500">
            Add section blocks to build the legal body. When empty, buyers see the built-in default
            sections until you add content.
          </p>
        }
      />
    </div>
  );
}
