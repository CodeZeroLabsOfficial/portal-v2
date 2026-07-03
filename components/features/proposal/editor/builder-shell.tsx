"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BuilderShellProps {
  topBar: React.ReactNode;
  outline: React.ReactNode;
  canvas: React.ReactNode;
  inspector: React.ReactNode;
  className?: string;
}

const BUILDER_LAYOUT_COOKIE = "proposal_builder_layout";

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
                <SheetTitle>Blocks</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto p-4">{outline}</div>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                Inspector
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,24rem)] p-0">
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle>Inspector</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto p-4">{inspector}</div>
            </SheetContent>
          </Sheet>
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto">{canvas}</main>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-dvh flex-col", className)}>
      {topBar}
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-0 flex-1"
        id={BUILDER_LAYOUT_COOKIE}
      >
        <ResizablePanel id="outline" defaultSize={16} minSize={12} maxSize={24} collapsible>
          {outline}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel id="canvas" defaultSize={54} minSize={40}>
          <main className="h-full overflow-y-auto">{canvas}</main>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel id="inspector" defaultSize={30} minSize={22} maxSize={36}>
          {inspector}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
