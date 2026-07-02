import type { LucideIcon } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FilterPillOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

export interface FilterPillGroupProps<T extends string> {
  label?: string;
  options: FilterPillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

export function FilterPillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  className
}: FilterPillGroupProps<T>) {
  return (
    <div className={className}>
      {label ? <Label className="mb-3 block text-sm font-medium">{label}</Label> : null}
      <div className="flex flex-wrap gap-2">
        {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => {
          const isSelected = value === optionValue;
          return (
            <button
              key={optionValue}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onChange(optionValue)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary"
              )}>
              {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
