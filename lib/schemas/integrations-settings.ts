import { z } from "zod";

const stripePublishableKeyPattern = /^pk_(test|live)_/;

export const updateIntegrationsSettingsSchema = z.object({
  stripePublishableKey: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || stripePublishableKeyPattern.test(value), {
      message: "Publishable key must start with pk_test_ or pk_live_.",
    }),
  webhookUrl: z.union([z.literal(""), z.string().url("Enter a valid HTTPS URL.")]),
});

export type UpdateIntegrationsSettingsInput = z.infer<typeof updateIntegrationsSettingsSchema>;
