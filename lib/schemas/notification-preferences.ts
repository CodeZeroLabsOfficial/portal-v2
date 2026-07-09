import { z } from "zod";

export const updateNotificationPreferencesSchema = z.object({
  inAppScope: z.enum(["all", "none"]),
  emailEnabled: z.boolean(),
  securityEmail: z.literal(true),
});

export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>;
