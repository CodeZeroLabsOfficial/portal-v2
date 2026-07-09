"use client";

import * as React from "react";

import type { SignedAgreementView } from "@/lib/proposal/agreement/signed-agreement-view";

export type PrintAgreementDocumentInput = { documentTitle?: string } | SignedAgreementView;

/** Applied to `document.body` while printing an agreement modal (see `app/globals.css`). */
export const AGREEMENT_PRINT_BODY_CLASS = "agreement-print-mode";

/** Marks the Services Agreement body printed from the modal (title, intro, legal — not proposal UI). */
export const AGREEMENT_PRINT_TARGET_ATTR = "data-agreement-print-target";

/** Descendants excluded from agreement PDF/print even when inside the print target. */
export const AGREEMENT_PRINT_EXCLUDE_ATTR = "data-agreement-print-exclude";

/**
 * Isolates the agreement document for `window.print()`:
 * hides the rest of the page and removes modal chrome via print CSS.
 */
export function useAgreementPrintMode() {
  React.useEffect(() => {
    function onBeforePrint() {
      document.body.classList.add(AGREEMENT_PRINT_BODY_CLASS);
    }
    function onAfterPrint() {
      document.body.classList.remove(AGREEMENT_PRINT_BODY_CLASS);
    }
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      document.body.classList.remove(AGREEMENT_PRINT_BODY_CLASS);
    };
  }, []);
}

function resolvePrintDocumentTitle(input?: PrintAgreementDocumentInput): string | undefined {
  if (!input) return undefined;
  if ("record" in input) {
    return input.agreementTitle?.trim() || undefined;
  }
  return input.documentTitle?.trim() || undefined;
}

export function printAgreementDocument(input?: PrintAgreementDocumentInput) {
  const previousTitle = document.title;
  const nextTitle = resolvePrintDocumentTitle(input);
  if (nextTitle) {
    document.title = nextTitle;
  }
  document.body.classList.add(AGREEMENT_PRINT_BODY_CLASS);

  function cleanupAfterPrint() {
    document.body.classList.remove(AGREEMENT_PRINT_BODY_CLASS);
    if (nextTitle) {
      document.title = previousTitle;
    }
    window.removeEventListener("afterprint", cleanupAfterPrint);
  }

  window.addEventListener("afterprint", cleanupAfterPrint);
  requestAnimationFrame(() => {
    window.print();
  });
}
