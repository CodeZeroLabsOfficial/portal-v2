"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BuilderTopBarTitle } from "@/components/features/proposal/editor/builder-top-bar-title";
import { BuilderSidePanelToggles } from "@/components/features/proposal/editor/builder-side-panel-toggles";

export interface BuilderTopBarProps {
  backHref: string;
  backLabel: string;
  titleFallback: string;
  actions: React.ReactNode;
  className?: string;
}

export function BuilderTopBar({
  backHref,
  backLabel,
  titleFallback,
  actions,
  className,
}: BuilderTopBarProps) {
  return (
    <header
      className={cn(
        "border-border/80 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
        <Button variant="outline" size="icon-sm" className="shrink-0" asChild>
          <Link href={backHref} aria-label={backLabel}>
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <BuilderSidePanelToggles />
        <div className="flex h-8 min-w-[10rem] flex-1 basis-[14rem] items-center border-b border-border">
          <BuilderTopBarTitle fallbackLabel={titleFallback} />
        </div>
        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
      </div>
    </header>
  );
}

export interface BuilderPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function BuilderPanel({ title, children, className }: BuilderPanelProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex shrink-0 flex-col gap-4 px-6 pt-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Separator />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4">{children}</div>
    </div>
  );
}
