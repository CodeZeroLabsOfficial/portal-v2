import { z } from "zod";
import {
  companyWebsiteField,
  optionalCompanyEmail,
  optionalTrimmed,
} from "@/lib/schemas/customer";

const trimmed = z.string().trim();

const accountCompanyFieldsSchema = z.object({
  company: trimmed.min(1, "Company name is required").max(200),
  companyPhone: optionalTrimmed,
  companyEmail: optionalCompanyEmail,
  companyWebsite: companyWebsiteField,
  companyAbn: optionalTrimmed,
  companyAcn: optionalTrimmed,
  companyAddressLine1: optionalTrimmed,
  companyAddressLine2: optionalTrimmed,
  companyCity: optionalTrimmed,
  companyRegion: optionalTrimmed,
  companyPostalCode: optionalTrimmed,
  companyCountry: optionalTrimmed,
});

export const createAccountFormSchema = accountCompanyFieldsSchema;

export type CreateAccountFormInput = z.infer<typeof createAccountFormSchema>;

export const updateAccountFormSchema = accountCompanyFieldsSchema.extend({
  id: z.string().min(1),
});

export type UpdateAccountFormInput = z.infer<typeof updateAccountFormSchema>;
