import { z } from "zod";

import { THEME_COLOR_VALUES } from "@/lib/themes";

const themeColorValues = THEME_COLOR_VALUES as unknown as [
  (typeof THEME_COLOR_VALUES)[number],
  ...(typeof THEME_COLOR_VALUES)[number][],
];

export const updateAppearanceSettingsSchema = z.object({
  portalName: z.string().trim().min(1, "Portal name is required.").max(120),
  themeColor: z.enum(themeColorValues),
  logoUrl: z.union([z.literal(""), z.string().url()]),
  faviconUrl: z.union([z.literal(""), z.string().url()]),
});

export type UpdateAppearanceSettingsInput = z.infer<typeof updateAppearanceSettingsSchema>;
