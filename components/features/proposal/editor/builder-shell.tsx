"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BuilderCollapsibleAside } from "@/components/features/proposal/editor/builder-collapsible-aside";

export interface BuilderShellProps {
  topBar: React.ReactNode;
  outline: React.ReactNode;
  canvas: React.ReactNode;
  inspector: React.ReactNode;
  className?: string;
}

const BUILDER_OUTLINE_STORAGE_KEY = "proposal_builder_outline_open";
const BUILDER_INSPECTOR_STORAGE_KEY = "proposal_builder_inspector_open";

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
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <BuilderCollapsibleAside
          side="left"
          label="Outline"
          storageKey={BUILDER_OUTLINE_STORAGE_KEY}
        >
          {outline}
        </BuilderCollapsibleAside>
        <main className="min-h-0 min-w-0 flex-[1_1_70%] overflow-y-auto">{canvas}</main>
        <BuilderCollapsibleAside
          side="right"
          label="Inspector"
          storageKey={BUILDER_INSPECTOR_STORAGE_KEY}
        >
          {inspector}
        </BuilderCollapsibleAside>
      </div>
    </div>
  );
}
