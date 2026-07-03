"use client";

import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

import { useBuilderSidePanels } from "@/components/features/proposal/editor/builder-side-panel-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

/** Desktop outline / inspector toggles — matches portal `SiteHeader` sidebar control pattern. */
export function BuilderSidePanelToggles() {
  const isMobile = useIsMobile();
  const { outlineOpen, inspectorOpen, toggleOutline, toggleInspector } = useBuilderSidePanels();

  if (isMobile) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={toggleOutline}
        aria-label={outlineOpen ? "Hide outline" : "Show outline"}
        aria-pressed={outlineOpen}
      >
        {outlineOpen ? (
          <PanelLeftClose className="size-4" aria-hidden />
        ) : (
          <PanelLeftOpen className="size-4" aria-hidden />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={toggleInspector}
        aria-label={inspectorOpen ? "Hide inspector" : "Show inspector"}
        aria-pressed={inspectorOpen}
      >
        {inspectorOpen ? (
          <PanelRightClose className="size-4" aria-hidden />
        ) : (
          <PanelRightOpen className="size-4" aria-hidden />
        )}
      </Button>
      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
    </>
  );
}
