import type { UpdateAccountFormInput } from "@/lib/schemas/account";
import type { AccountRecord } from "@/types/account";

export function accountToFormDefaults(account: AccountRecord): UpdateAccountFormInput {
  return {
    id: account.id,
    company: account.company,
    companyPhone: account.companyPhone ?? "",
    companyEmail: account.companyEmail ?? "",
    companyWebsite: account.companyWebsite ?? "",
    companyAbn: account.companyAbn ?? "",
    companyAcn: account.companyAcn ?? "",
    companyAddressLine1: account.companyAddressLine1 ?? "",
    companyAddressLine2: account.companyAddressLine2 ?? "",
    companyCity: account.companyCity ?? "",
    companyRegion: account.companyRegion ?? "",
    companyPostalCode: account.companyPostalCode ?? "",
    companyCountry: account.companyCountry ?? "",
  };
}

export type AccountInlineFieldOverrides = Partial<
  Pick<
    UpdateAccountFormInput,
    | "company"
    | "companyPhone"
    | "companyEmail"
    | "companyWebsite"
    | "companyAbn"
    | "companyAcn"
    | "companyAddressLine1"
    | "companyAddressLine2"
    | "companyCity"
    | "companyRegion"
    | "companyPostalCode"
    | "companyCountry"
  >
>;

export function buildAccountUpdatePayload(
  account: AccountRecord,
  overrides: AccountInlineFieldOverrides = {},
): UpdateAccountFormInput {
  return {
    ...accountToFormDefaults(account),
    ...overrides,
    id: account.id,
  };
}
