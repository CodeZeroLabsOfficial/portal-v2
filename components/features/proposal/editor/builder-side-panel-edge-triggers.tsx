"use client";

import { PanelLeftOpen, PanelRightOpen } from "lucide-react";

import { useBuilderSidePanels } from "@/components/features/proposal/editor/builder-side-panel-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

/** Aligns with the `BuilderPanel` header row (top bar height + `pt-6`). */
const EDGE_TRIGGER_TOP_CLASS = "top-[calc(theme(spacing.12)+theme(spacing.6))]";

interface BuilderSidePanelEdgeTriggerProps {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}

function BuilderSidePanelEdgeTrigger({ side, label, onClick }: BuilderSidePanelEdgeTriggerProps) {
  const isLeft = side === "left";
  const OpenIcon = isLeft ? PanelLeftOpen : PanelRightOpen;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "fixed z-30 size-8 rounded-md border bg-background shadow-sm",
        EDGE_TRIGGER_TOP_CLASS,
        isLeft ? "left-0 rounded-l-none border-l-0" : "right-0 rounded-r-none border-r-0",
      )}
    >
      <OpenIcon className="size-4" aria-hidden />
    </Button>
  );
}

/** Desktop edge affordances to reopen collapsed outline / inspector panels. */
export function BuilderSidePanelEdgeTriggers() {
  const isMobile = useIsMobile();
  const { outlineOpen, inspectorOpen, toggleOutline, toggleInspector } = useBuilderSidePanels();

  if (isMobile) {
    return null;
  }

  return (
    <>
      {!outlineOpen ? (
        <BuilderSidePanelEdgeTrigger side="left" label="Show outline" onClick={toggleOutline} />
      ) : null}
      {!inspectorOpen ? (
        <BuilderSidePanelEdgeTrigger side="right" label="Show properties" onClick={toggleInspector} />
      ) : null}
    </>
  );
}
