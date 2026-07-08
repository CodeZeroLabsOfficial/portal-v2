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
