"use client";

import { THEME_COLORS, type ThemeColorId } from "@/lib/themes";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ThemeColorSelectorProps {
  value: ThemeColorId;
  onValueChange: (value: ThemeColorId) => void;
}

export function ThemeColorSelector({ value, onValueChange }: ThemeColorSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="theme-color">Theme colour</Label>
      <Select value={value} onValueChange={(next) => onValueChange(next as ThemeColorId)}>
        <SelectTrigger id="theme-color" className="w-full">
          <SelectValue placeholder="Select a colour" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">
            <span className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: "oklch(0.205 0 0)" }}
              />
              Default
            </span>
          </SelectItem>
          {THEME_COLORS.map((color) => (
            <SelectItem key={color.value} value={color.value}>
              <span className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: `var(--color-${color.value}-600)` }}
                />
                {color.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
