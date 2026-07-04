import { z } from "zod";

import { isNoteBodyEmpty } from "@/lib/crm/customer-note-body";

const trimmed = z.string().trim();

export const addOpportunityNoteSchema = z
  .object({
    opportunityId: z.string().min(1),
    title: trimmed
      .max(200, "Title must be at most 200 characters")
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined)),
    body: z.string().trim().max(8000, "Note must be at most 8000 characters"),
    bodyFormat: z.enum(["plain", "html"]).default("html"),
    kind: z.enum(["note", "call", "email"]).default("note"),
  })
  .superRefine((data, ctx) => {
    if (isNoteBodyEmpty(data.body, data.bodyFormat)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Note cannot be empty",
        path: ["body"],
      });
    }
  });

export type AddOpportunityNoteInput = z.infer<typeof addOpportunityNoteSchema>;
