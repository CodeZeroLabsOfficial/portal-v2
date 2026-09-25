/** Narrow side sheet — default `sm:max-w-sm` (tasks, template properties). */
export const sheetContentClass = "flex w-full flex-col overflow-hidden";

/**
 * Must repeat the sheet primitive's `data-[side=*]:sm:` variant. A plain
 * `sm:max-w-*` does not override `data-[side=right]:sm:max-w-sm`.
 */
export const sheetContentMediumClass =
  "flex w-full flex-col overflow-hidden data-[side=left]:sm:max-w-lg data-[side=right]:sm:max-w-lg";

/** Wide forms — `sm:max-w-2xl`. */
export const sheetContentWideClass =
  "flex w-full flex-col overflow-hidden data-[side=left]:sm:max-w-2xl data-[side=right]:sm:max-w-2xl";

/** Form fills the sheet under the header so the footer stays pinned. */
export const sheetFormClass = "flex min-h-0 flex-1 flex-col";

/**
 * Scrollable fields. `min-h-0` lets this region shrink inside the flex column;
 * without it the footer is pushed off the bottom.
 */
export const sheetFormBodyClass = "min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-6";

/** Pinned action bar. Stays inside the form so submit still works. */
export const sheetFormFooterClass = "shrink-0 border-t px-4 py-4";

/** SheetFooter row: spacer or destructive action on the left, primary actions on the right. */
export const sheetFooterClass =
  "mt-auto flex-row items-center justify-between gap-2 p-0 sm:justify-between";

/** Tab panels aligned to form vertical rhythm. */
export const sheetTabsClass = "gap-6";

/** Right-aligned cluster inside the footer (Cancel + Save). */
export const sheetActionsEndClass = "flex items-center justify-end gap-2";
