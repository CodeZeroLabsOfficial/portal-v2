import { z } from "zod";

import { BRANDING_FONTS } from "@/lib/fonts-config";

const brandingFontValues = BRANDING_FONTS.map((font) => font.value) as [
  (typeof BRANDING_FONTS)[number]["value"],
  ...(typeof BRANDING_FONTS)[number]["value"][],
];

const hexColorPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const updateAppearanceSettingsSchema = z.object({
  portalName: z.string().trim().min(1, "Portal name is required.").max(120),
  primaryColorHex: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || hexColorPattern.test(value), {
      message: "Primary colour must be a valid hex value (e.g. #0f172a).",
    }),
  fontFamily: z.enum(brandingFontValues),
  logoUrl: z.union([z.literal(""), z.string().url()]),
  faviconUrl: z.union([z.literal(""), z.string().url()]),
});

export type UpdateAppearanceSettingsInput = z.infer<typeof updateAppearanceSettingsSchema>;
