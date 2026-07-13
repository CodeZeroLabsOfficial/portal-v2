/** Shared CRM customer profile fields for create/edit forms. */
export interface CustomerProfileFormValues {
  id?: string;
  name: string;
  email: string;
  accountId?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  tags?: string[];
  saveAsLead?: boolean;
}

export const EMPTY_CUSTOMER_PROFILE_FORM_VALUES: CustomerProfileFormValues = {
  name: "",
  email: "",
  accountId: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
  tags: [],
  saveAsLead: false,
};
