/** Dedicated title page — page 1 in agreement Download / print. */
export const AGREEMENT_PRINT_TITLE_PAGE_ATTR = "data-agreement-print-title-page";

/** Wraps legal body in print CSS (typography). */
export const AGREEMENT_PRINT_LEGAL_BODY_ATTR = "data-agreement-legal-body";

/** Default placeholder legal sections (no custom HTML). */
export const AGREEMENT_PRINT_LEGAL_SECTIONS_ATTR = "data-agreement-legal-sections";

/** Fixed footer on every printed page — company name from Settings → Company. */
export const AGREEMENT_PRINT_FOOTER_ATTR = "data-agreement-print-footer";

export const AGREEMENT_PRINT_TITLE_PAGE_CLASSES =
  "print:flex print:min-h-[calc(100vh-40mm)] print:items-center print:justify-center print:break-after-page";

/** Screen layout matching agreement PDF page 1 — centered hero title on white. */
export const AGREEMENT_TITLE_PAGE_SCREEN_CLASSES =
  "flex h-full min-h-full w-full items-center justify-center bg-background";

/** Shared horizontal shell for agreement print target panes. */
export const AGREEMENT_PRINT_TARGET_SHELL_CLASSES =
  "mx-auto w-full max-w-6xl px-5 py-12 sm:px-10 sm:py-16 print:max-w-none print:px-0 print:py-0";
