import { z } from "zod";

export const templateCatalogMetaSchema = z
  .object({
    subtitle: z.string().max(200).optional(),
    useCase: z.string().max(120).optional(),
    category: z.string().max(120).optional(),
    keyFeatures: z.array(z.string().trim().min(1).max(80)).max(8).optional(),
    version: z.string().max(32).optional(),
  })
  .optional();
