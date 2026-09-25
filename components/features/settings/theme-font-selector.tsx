"use client";

import type { ThemeDisplayFontId, ThemeFontId } from "@/lib/themes";
import { THEME_DISPLAY_FONTS, THEME_FONTS } from "@/lib/themes";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FontOption {
  name: string;
  value: string;
}

interface ThemeFontSelectProps<T extends string> {
  id: string;
  label: string;
  value: T;
  fonts: readonly FontOption[];
  onValueChange: (value: T) => void;
}

function ThemeFontSelect<T extends string>({
  id,
  label,
  value,
  fonts,
  onValueChange,
}: ThemeFontSelectProps<T>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(next) => onValueChange(next as T)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select a font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default</SelectItem>
          {fonts.map((font) => (
            <SelectItem
              key={font.value}
              value={font.value}
              style={{ fontFamily: `var(--font-${font.value})` }}
            >
              {font.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface ThemeFontSelectorProps {
  value: ThemeFontId;
  onValueChange: (value: ThemeFontId) => void;
}

export function ThemeFontSelector({ value, onValueChange }: ThemeFontSelectorProps) {
  return (
    <ThemeFontSelect
      id="theme-font"
      label="Font"
      value={value}
      fonts={THEME_FONTS}
      onValueChange={onValueChange}
    />
  );
}

interface ThemeDisplayFontSelectorProps {
  value: ThemeDisplayFontId;
  onValueChange: (value: ThemeDisplayFontId) => void;
}

export function ThemeDisplayFontSelector({
  value,
  onValueChange,
}: ThemeDisplayFontSelectorProps) {
  return (
    <ThemeFontSelect
      id="theme-display-font"
      label="Display font"
      value={value}
      fonts={THEME_DISPLAY_FONTS}
      onValueChange={onValueChange}
    />
  );
}
