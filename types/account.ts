/** CRM account document in `accounts/{accountId}` (Firestore). */
export type AccountLifecycleStatus = "active" | "archived";

export interface AccountRecord {
  id: string;
  /** Legacy multi-tenant field — optional; single-tenant CRM does not require it. */
  organizationId?: string;
  company: string;
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
  status: AccountLifecycleStatus;
  /** Epoch millis — Firestore `createdAt`. */
  createdAt: number;
  /** Epoch millis — Firestore `updatedAt`. */
  updatedAt: number;
  createdByUid?: string;
}

/** Account detail page: company fields plus linked contacts. */
export interface AccountDetailAggregate extends AccountRecord {
  contacts: import("@/types/customer").CustomerRecord[];
}
