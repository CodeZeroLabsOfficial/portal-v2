/** Shared CRM customer profile fields for create/edit forms. */
export interface CustomerProfileFormValues {
  id?: string;
  name: string;
  email: string;
  company?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyAbn?: string;
  companyAcn?: string;
  companyAddressLine1?: string;
  companyAddressLine2?: string;
  companyCity?: string;
  companyRegion?: string;
  companyPostalCode?: string;
  companyCountry?: string;
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
  company: "",
  companyPhone: "",
  companyEmail: "",
  companyWebsite: "",
  companyAbn: "",
  companyAcn: "",
  companyAddressLine1: "",
  companyAddressLine2: "",
  companyCity: "",
  companyRegion: "",
  companyPostalCode: "",
  companyCountry: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
  tags: [],
  saveAsLead: false
};
