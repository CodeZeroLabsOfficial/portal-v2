"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBuilderSidePanels } from "@/components/features/proposal/editor/builder-side-panel-context";
import { BuilderSidePanel } from "@/components/features/proposal/editor/builder-side-panel";
import { BuilderSidePanelEdgeTriggers } from "@/components/features/proposal/editor/builder-side-panel-edge-triggers";

export interface BuilderShellProps {
  topBar: React.ReactNode;
  outline: React.ReactNode;
  canvas: React.ReactNode;
  inspector: React.ReactNode;
  className?: string;
}

/** Track widths (`20vw`) must match `BUILDER_SIDE_PANEL_WIDTH_CLASSES` so panels fill their cell exactly. */
function builderDesktopGridColumns(outlineOpen: boolean, inspectorOpen: boolean): string {
  if (outlineOpen && inspectorOpen) return "grid-cols-[20vw_minmax(0,1fr)_20vw]";
  if (outlineOpen) return "grid-cols-[20vw_minmax(0,1fr)_0px]";
  if (inspectorOpen) return "grid-cols-[0px_minmax(0,1fr)_20vw]";
  return "grid-cols-[0px_minmax(0,1fr)_0px]";
}

function BuilderDesktopLayout({
  outline,
  canvas,
  inspector,
}: {
  outline: React.ReactNode;
  canvas: React.ReactNode;
  inspector: React.ReactNode;
}) {
  const { outlineOpen, inspectorOpen } = useBuilderSidePanels();

  return (
    <div
      className={cn(
        "grid min-h-0 flex-1 transition-[grid-template-columns] duration-200 ease-linear motion-reduce:transition-none",
        builderDesktopGridColumns(outlineOpen, inspectorOpen),
      )}
    >
      <BuilderSidePanel side="left" label="Outline" open={outlineOpen}>
        {outline}
      </BuilderSidePanel>
      <main className="relative min-h-0 min-w-0 overflow-hidden">
        <div className="h-full min-h-0 overflow-x-clip overflow-y-auto scroll-pt-12">{canvas}</div>
      </main>
      <BuilderSidePanel side="right" label="Properties" open={inspectorOpen}>
        {inspector}
      </BuilderSidePanel>
    </div>
  );
}

export function BuilderShell({ topBar, outline, canvas, inspector, className }: BuilderShellProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn("flex min-h-dvh flex-col", className)}>
        {topBar}
        <div className="flex gap-2 border-b px-4 py-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                Outline
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw-2rem,20rem)] p-0">
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle>Outline</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto p-4">{outline}</div>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                Properties
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,24rem)] p-0">
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle>Properties</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto p-4">{inspector}</div>
            </SheetContent>
          </Sheet>
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto scroll-pt-12">{canvas}</main>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-dvh flex-col", className)}>
      {topBar}
      <BuilderSidePanelEdgeTriggers />
      <BuilderDesktopLayout outline={outline} canvas={canvas} inspector={inspector} />
    </div>
  );
}
