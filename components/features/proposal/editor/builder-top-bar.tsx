"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { BuilderBreadcrumbTitleSegment } from "@/components/features/proposal/editor/builder-breadcrumb-title";
import { BuilderSidePanelToggles } from "@/components/features/proposal/editor/builder-side-panel-toggles";

export interface BuilderBreadcrumbSegment {
  label: string;
  href?: string;
}

export interface BuilderTopBarProps {
  backHref: string;
  backLabel: string;
  segments: BuilderBreadcrumbSegment[];
  actions: React.ReactNode;
  className?: string;
}

export function BuilderTopBar({
  backHref,
  backLabel,
  segments,
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
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList>
            {segments.map((segment, index) => {
              const isLast = index === segments.length - 1;
              return (
                <React.Fragment key={`${segment.label}-${index}`}>
                  {index > 0 ? <BreadcrumbSeparator /> : null}
                  <BreadcrumbItem>
                    {isLast ? (
                      <BuilderBreadcrumbTitleSegment fallbackLabel={segment.label} />
                    ) : segment.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={segment.href}>{segment.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="max-w-[12rem] truncate sm:max-w-xs">
                        {segment.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
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
      <div className="border-border border-b px-4 py-2">
        <Typography variant="h4">{title}</Typography>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}
