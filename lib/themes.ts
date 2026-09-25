export const DEFAULT_THEME = {
  preset: "default",
  radius: "default",
  scale: "none",
  contentLayout: "full"
} as const;

/** Tailwind 600 shades used by `[data-theme-color]` in `app/themes.css`. */
export const THEME_COLORS = [
  { name: "Red", value: "red" },
  { name: "Orange", value: "orange" },
  { name: "Amber", value: "amber" },
  { name: "Yellow", value: "yellow" },
  { name: "Lime", value: "lime" },
  { name: "Green", value: "green" },
  { name: "Emerald", value: "emerald" },
  { name: "Teal", value: "teal" },
  { name: "Cyan", value: "cyan" },
  { name: "Sky", value: "sky" },
  { name: "Blue", value: "blue" },
  { name: "Indigo", value: "indigo" },
  { name: "Violet", value: "violet" },
  { name: "Purple", value: "purple" },
  { name: "Fuchsia", value: "fuchsia" },
  { name: "Pink", value: "pink" },
  { name: "Rose", value: "rose" },
] as const;

export const THEME_COLOR_VALUES = ["default", ...THEME_COLORS.map((color) => color.value)] as const;

export type ThemeColorId = (typeof THEME_COLOR_VALUES)[number];

export const DEFAULT_THEME_COLOR: ThemeColorId = "default";

export function isThemeColorId(value: string | undefined): value is ThemeColorId {
  return THEME_COLOR_VALUES.some((color) => color === value);
}

export type ThemeType = typeof DEFAULT_THEME;
