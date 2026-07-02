"use client";

import { useThemeConfig } from "@/components/active-theme";
import { DEFAULT_THEME, THEMES } from "@/lib/themes";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ColourPresetSelector() {
  const { theme, setTheme } = useThemeConfig();

  return (
    <div className="space-y-2">
      <Label htmlFor="theme-preset">Colour preset</Label>
      <Select
        value={theme.preset}
        onValueChange={(value) =>
          setTheme({ ...theme, ...DEFAULT_THEME, preset: value as typeof theme.preset })
        }
      >
        <SelectTrigger id="theme-preset" className="w-full">
          <SelectValue placeholder="Select a preset" />
        </SelectTrigger>
        <SelectContent>
          {THEMES.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              <div className="flex items-center gap-2">
                <div className="flex shrink-0 gap-1">
                  {preset.colors.map((color, index) => (
                    <span
                      key={index}
                      className="size-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {preset.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
