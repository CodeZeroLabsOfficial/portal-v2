import { PROPOSAL_EDITOR_BLOCK_CANVAS_INNER_CLASSES } from "@/lib/proposal/public/public-layout";

/**
 * Full-bleed builder canvas: the scroll wrapper carries no side/top padding so section
 * bands run edge-to-edge within the builder center column. Horizontal breathing room is
 * applied inside bands (see {@link BUILDER_ROOT_BLOCK_INSET_CLASSES}) rather than on the canvas.
 */
export const BUILDER_CANVAS_WRAPPER_CLASSES = "w-full";

/**
 * Horizontal inset for root-level blocks that are NOT full-bleed bands (text, header,
 * dividers, etc.). Flush bands (section/splash/packages+bg/agreement+bg) skip this and
 * span the full canvas width; their content inset lives inside the band shell.
 */
export const BUILDER_ROOT_BLOCK_INSET_CLASSES = PROPOSAL_EDITOR_BLOCK_CANVAS_INNER_CLASSES;
