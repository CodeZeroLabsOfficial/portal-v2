"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export interface NumericStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  className?: string;
}

function clampValue(value: number, min: number, max?: number): number {
  const floored = Math.max(min, Math.floor(value));
  if (typeof max === "number" && Number.isFinite(max)) {
    return Math.min(max, floored);
  }
  return floored;
}

export function NumericStepper({
  value,
  onChange,
  min = 0,
  max,
  disabled = false,
  id,
  "aria-label": ariaLabel,
  className,
}: NumericStepperProps) {
  const current = clampValue(value, min, max);
  const atMin = current <= min;
  const atMax = typeof max === "number" && current >= max;

  function setNext(next: number) {
    onChange(clampValue(next, min, max));
  }

  return (
    <div
      id={id}
      className={cn(
        "inline-flex h-8 items-stretch overflow-hidden rounded-lg border border-input bg-transparent dark:bg-input/30",
        disabled && "opacity-50",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        disabled={disabled || atMin}
        className={cn(
          "text-foreground inline-flex w-7 shrink-0 items-center justify-center outline-none transition-colors",
          "hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
          "disabled:pointer-events-none",
          !disabled && atMin && "opacity-50",
        )}
        aria-label={ariaLabel ? `Decrease ${ariaLabel}` : "Decrease"}
        onClick={() => setNext(current - 1)}
      >
        <Minus className="size-3.5" aria-hidden />
      </button>
      <span
        className="text-foreground min-w-8 px-1 text-center text-sm font-medium tabular-nums"
        aria-live="polite"
      >
        {current}
      </span>
      <button
        type="button"
        disabled={disabled || atMax}
        className={cn(
          "text-foreground inline-flex w-7 shrink-0 items-center justify-center outline-none transition-colors",
          "hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
          "disabled:pointer-events-none",
          !disabled && atMax && "opacity-50",
        )}
        aria-label={ariaLabel ? `Increase ${ariaLabel}` : "Increase"}
        onClick={() => setNext(current + 1)}
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
