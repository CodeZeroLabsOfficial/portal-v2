import { AGREEMENT_MODAL_LIGHT_SURFACE_CLASSES } from "@/lib/proposal/editor-surface-tokens";
import { cn } from "@/lib/utils";

/** In-modal scroll anchor at the top of the agreement document. */
export const AGREEMENT_TOP_ANCHOR_ID = "agreement-top";

/** Buyer plan selection section — staff uses `agreement-summary` instead. */
export const AGREEMENT_PLAN_SECTION_ID = "agreement-plan";

/** Staff CRM agreement summary section. */
export const AGREEMENT_SUMMARY_SECTION_ID = "agreement-summary";

/** Buyer sign form / post-sign success card (screen only). */
export const AGREEMENT_SIGN_SECTION_ID = "agreement-sign";

/** Shared full-screen agreement dialog surface — buyer and staff modals. */
export const AGREEMENT_MODAL_DIALOG_CONTENT_CLASSES = cn(
  AGREEMENT_MODAL_LIGHT_SURFACE_CLASSES,
  "z-50 grid gap-0 overflow-hidden border-0 p-0 shadow-2xl",
  "h-[100dvh] w-screen max-w-none left-0 top-0 translate-x-0 translate-y-0 rounded-none",
  "sm:left-1/2 sm:top-1/2 sm:h-[min(96dvh,960px)] sm:max-h-[96dvh]",
  "sm:w-[min(1536px,calc(100vw-3rem))] sm:max-w-[min(1536px,calc(100vw-3rem))]",
  "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
  "print:static print:inset-auto print:h-auto print:max-h-none print:w-full print:max-w-none",
  "print:translate-x-0 print:translate-y-0 print:rounded-none print:shadow-none print:overflow-visible",
  "grid-rows-[auto,1fr] print:grid-rows-1",
  "pt-[max(0px,env(safe-area-inset-top))] sm:pt-0",
);
