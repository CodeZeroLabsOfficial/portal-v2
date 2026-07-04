"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { AGREEMENT_MODAL_INK_TEXT_CLASSES } from "@/lib/proposal/public/public-typography";
import { cn } from "@/lib/utils";

export interface AgreementDisclaimerCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Proposal CTA colour — fills the box when checked. */
  ctaColor: string;
  children: React.ReactNode;
}

/** Native checkbox with legacy agreement-modal visual (32×32, CTA fill). */
export function AgreementDisclaimerCheckbox({
  checked,
  onCheckedChange,
  disabled = false,
  ctaColor,
  children,
}: AgreementDisclaimerCheckboxProps) {
  return (
    <label
      className={cn(
        "group flex cursor-pointer items-start gap-3 text-sm leading-snug",
        AGREEMENT_MODAL_INK_TEXT_CLASSES,
        disabled && "pointer-events-none cursor-not-allowed opacity-60",
      )}
    >
      <span className="relative mt-0.5 size-8 shrink-0">
        <input
          type="checkbox"
          className="absolute inset-0 z-10 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          disabled={disabled}
        />
        <span
          aria-hidden
          className={cn(
            "flex size-8 items-center justify-center rounded-md border-2 border-slate-300 bg-white transition-colors",
            "group-focus-within:ring-2 group-focus-within:ring-slate-400/45 group-focus-within:ring-offset-2 group-focus-within:ring-offset-zinc-50",
          )}
          style={checked ? { backgroundColor: ctaColor } : undefined}
        >
          <Check
            className="size-[15px] text-white opacity-0 transition-opacity duration-150 group-has-[:checked]:opacity-100"
            strokeWidth={2.75}
            aria-hidden
          />
        </span>
      </span>
      <span>{children}</span>
    </label>
  );
}
