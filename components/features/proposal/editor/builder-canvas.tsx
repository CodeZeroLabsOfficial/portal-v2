import { BUILDER_CANVAS_WRAPPER_CLASSES } from "@/lib/proposal/editor-canvas-layout";
import { cn } from "@/lib/utils";

/**
 * Full-bleed scroll wrapper for the builder edit surface. Carries no side/top padding so
 * section bands run edge-to-edge within the center column; bottom scroll reserve is applied
 * by the edit tab content.
 */
export function BuilderCanvas({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(BUILDER_CANVAS_WRAPPER_CLASSES, className)}>{children}</div>;
}
