"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface DecimalStepperProps {
  value: string;
  onChange: (next: string) => void;
  step?: number;
  min?: number;
  max?: number;
  decimals?: number;
  /** When true, blur with an empty field keeps "". */
  allowEmpty?: boolean;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
}

function parseMajor(raw: string): number {
  const normalized = raw.trim().replace(/,/g, "");
  if (!normalized || normalized === ".") return 0;
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function clampMajor(value: number, min: number, max?: number): number {
  let next = Math.max(min, value);
  if (typeof max === "number" && Number.isFinite(max)) {
    next = Math.min(max, next);
  }
  return next;
}

function formatMajor(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

function sanitizeDecimalDraft(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

export function DecimalStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  decimals = 2,
  allowEmpty = false,
  disabled = false,
  id,
  placeholder = "0.00",
  "aria-label": ariaLabel,
  className,
}: DecimalStepperProps) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function displayValue(): string {
    return draft ?? value;
  }

  const currentMajor = parseMajor(displayValue());
  const minusDisabled = disabled || currentMajor <= min;

  function commitDraft(nextDraft: string | null) {
    if (nextDraft === null) return;

    const trimmed = nextDraft.trim();
    if (allowEmpty && trimmed === "") {
      onChange("");
      setDraft(null);
      return;
    }

    const clamped = clampMajor(parseMajor(trimmed), min, max);
    onChange(formatMajor(clamped, decimals));
    setDraft(null);
  }

  function stepBy(delta: number) {
    const base = draft !== null ? parseMajor(draft) : parseMajor(value);
    const next = clampMajor(base + delta, min, max);
    if (allowEmpty && next === 0 && value === "" && delta < 0) {
      onChange("");
      setDraft(null);
      return;
    }
    onChange(formatMajor(next, decimals));
    setDraft(null);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      stepBy(step);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      stepBy(-step);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      commitDraft(draft ?? value);
      inputRef.current?.blur();
    }
  }

  return (
    <div
      className={cn(
        "border-border/60 bg-background inline-flex items-center rounded-md border p-0.5 shadow-sm",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        disabled={minusDisabled}
        className={cn(
          "text-foreground inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm outline-none transition-colors",
          "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
        aria-label={ariaLabel ? `Decrease ${ariaLabel}` : "Decrease"}
        onClick={() => stepBy(-step)}
      >
        <Minus className="size-3.5" aria-hidden />
      </button>
      <Input
        ref={inputRef}
        id={id}
        inputMode="decimal"
        placeholder={placeholder}
        disabled={disabled}
        value={displayValue()}
        aria-label={ariaLabel}
        className={cn(
          "h-8 w-[5.5rem] border-0 bg-transparent px-1 text-center text-sm shadow-none tabular-nums",
          "focus-visible:ring-0 focus-visible:ring-offset-0",
        )}
        onFocus={() => setDraft(value)}
        onBlur={() => commitDraft(draft ?? value)}
        onKeyDown={handleKeyDown}
        onChange={(event) => setDraft(sanitizeDecimalDraft(event.target.value))}
      />
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "text-foreground inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm outline-none transition-colors",
          "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
        aria-label={ariaLabel ? `Increase ${ariaLabel}` : "Increase"}
        onClick={() => stepBy(step)}
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
