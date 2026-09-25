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

/** Body fonts. Values map to `[data-theme-font]` in `app/themes.css`. */
export const THEME_FONTS = [
  { name: "Inter", value: "inter" },
  { name: "Roboto", value: "roboto" },
  { name: "Poppins", value: "poppins" },
  { name: "Montserrat", value: "montserrat" },
  { name: "PT Sans", value: "pt-sans" },
  { name: "Overpass Mono", value: "overpass-mono" },
] as const;

/** Heading fonts. Values map to `[data-theme-display-font]` in `app/themes.css`. */
export const THEME_DISPLAY_FONTS = [
  { name: "Geist", value: "geist" },
  { name: "Montserrat", value: "montserrat" },
  { name: "Poppins", value: "poppins" },
  { name: "Plus Jakarta Sans", value: "plus-jakarta-sans" },
  { name: "Outfit", value: "outfit" },
  { name: "Kumbh Sans", value: "kumbh-sans" },
  { name: "Hedvig Letters Serif", value: "hedvig-letters-serif" },
] as const;

export const THEME_FONT_VALUES = ["default", ...THEME_FONTS.map((font) => font.value)] as const;

export const THEME_DISPLAY_FONT_VALUES = [
  "default",
  ...THEME_DISPLAY_FONTS.map((font) => font.value),
] as const;

export type ThemeFontId = (typeof THEME_FONT_VALUES)[number];

export type ThemeDisplayFontId = (typeof THEME_DISPLAY_FONT_VALUES)[number];

export const DEFAULT_THEME_FONT: ThemeFontId = "default";

export const DEFAULT_THEME_DISPLAY_FONT: ThemeDisplayFontId = "default";

export function isThemeFontId(value: string | undefined): value is ThemeFontId {
  return THEME_FONT_VALUES.some((font) => font === value);
}

export function isThemeDisplayFontId(value: string | undefined): value is ThemeDisplayFontId {
  return THEME_DISPLAY_FONT_VALUES.some((font) => font === value);
}

export type ThemeType = typeof DEFAULT_THEME;
