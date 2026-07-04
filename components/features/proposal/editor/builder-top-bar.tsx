"use client";

import { PanelLeftClose, PanelRightClose } from "lucide-react";

import { useBuilderSidePanels } from "@/components/features/proposal/editor/builder-side-panel-context";
import { PageBackButton } from "@/components/shared/page-back-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BuilderTopBarTitle } from "@/components/features/proposal/editor/builder-top-bar-title";
import { useIsMobile } from "@/hooks/use-mobile";

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
        <PageBackButton href={backHref} label={backLabel} />
        <div className="flex h-8 min-w-0 max-w-[min(36rem,calc(100vw-16rem))] items-center pl-2 sm:pl-3">
          <BuilderTopBarTitle fallbackLabel={titleFallback} />
        </div>
        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
      </div>
    </header>
  );
}

export interface BuilderPanelProps {
  title: string;
  side: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

export function BuilderPanel({ title, side, children, className }: BuilderPanelProps) {
  const isMobile = useIsMobile();
  const { toggleOutline, toggleInspector } = useBuilderSidePanels();
  const isLeft = side === "left";
  const onCollapse = isLeft ? toggleOutline : toggleInspector;
  const CollapseIcon = isLeft ? PanelLeftClose : PanelRightClose;
  const collapseLabel = isLeft ? "Hide outline" : "Hide inspector";

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex shrink-0 flex-col gap-4 px-6 pt-6">
        <div className="flex h-8 items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          {!isMobile ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground shrink-0"
              aria-label={collapseLabel}
              onClick={onCollapse}
            >
              <CollapseIcon className="size-4" aria-hidden />
            </Button>
          ) : null}
        </div>
        <Separator />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4">{children}</div>
    </div>
  );
}
