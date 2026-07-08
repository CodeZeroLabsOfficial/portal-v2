/**
 * Builder workspace layout tokens — desktop shell grid tracks and side-panel widths.
 *
 * Contract: panels are IN-FLOW grid children and only `grid-template-columns` animates.
 * Everything inside the canvas column sizes relative to the column (`w-full`), never the
 * viewport, so toggling a panel reflows the whole canvas as one container.
 */

/** Outline panel open width — must equal the left grid track (18rem). */
export const BUILDER_OUTLINE_PANEL_WIDTH_CLASS = "w-72";

/** Inspector panel open width — must equal the right grid track (20rem). */
export const BUILDER_INSPECTOR_PANEL_WIDTH_CLASS = "w-80";

/**
 * Desktop builder grid tracks. Full literal class strings (Tailwind JIT cannot compose
 * dynamic values); fixed rem side tracks keep panel content stable on any viewport while
 * the `minmax(0,1fr)` canvas column absorbs all resize.
 */
export function builderDesktopGridColumnsClass(
  outlineOpen: boolean,
  inspectorOpen: boolean,
): string {
  if (outlineOpen && inspectorOpen) return "grid-cols-[18rem_minmax(0,1fr)_20rem]";
  if (outlineOpen) return "grid-cols-[18rem_minmax(0,1fr)_0px]";
  if (inspectorOpen) return "grid-cols-[0px_minmax(0,1fr)_20rem]";
  return "grid-cols-[0px_minmax(0,1fr)_0px]";
}

/**
 * Bottom scroll reserve on the builder canvas so the last block can be scrolled up
 * toward the top of the viewport while editing.
 */
export const BUILDER_CANVAS_BOTTOM_RESERVE_CLASSES = "pb-[min(45vh,26rem)] sm:pb-40 md:pb-48";

/**
 * Horizontal content inset INSIDE a band or non-flush root row. Wide enough to host the
 * left gutter rail (≈4.25rem + gap) outside the content column. The canvas itself has
 * zero horizontal padding — flush bands span edge-to-edge and all inset lives here.
 */
export const BUILDER_BAND_CONTENT_INSET_CLASSES =
  "mx-auto w-full min-w-0 max-w-none px-20 sm:px-24";
