"use client";

import type { LucideIcon } from "lucide-react";
import { Check, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FormStepHeaderItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface FormStepHeaderProps {
  steps: FormStepHeaderItem[];
  /** 0-based active step index. */
  currentStep: number;
  className?: string;
}

/**
 * Horizontal step indicator for multi-step dialogs (icon + title + subtitle, chevron separators).
 */
export function FormStepHeader({ steps, currentStep, className }: FormStepHeaderProps) {
  return (
    <nav aria-label="Form steps" className={cn("flex flex-wrap items-start gap-2 sm:gap-3", className)}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isDone = index < currentStep;
        return (
          <div key={step.id} className="flex min-w-0 items-center gap-2 sm:gap-3">
            {index > 0 ? (
              <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden />
            ) : null}
            <div
              className={cn(
                "flex min-w-0 items-center gap-3",
                !isActive && !isDone && "opacity-60",
              )}
              aria-current={isActive ? "step" : undefined}>
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border",
                  isActive && "bg-primary text-primary-foreground border-primary",
                  isDone && "bg-primary/15 text-primary border-primary/30",
                  !isActive && !isDone && "bg-muted text-muted-foreground border-transparent",
                )}>
                {isDone ? <Check className="size-4" aria-hidden /> : <Icon className="size-4" aria-hidden />}
              </div>
              <div className="min-w-0">
                <p className={cn("truncate text-sm font-semibold", isActive && "text-foreground")}>
                  {step.title}
                </p>
                <p className="text-muted-foreground truncate text-xs">{step.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
