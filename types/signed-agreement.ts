export interface SignedAgreementAddonSnapshot {
  label: string;
  quantity: number;
  unitAmountMinor: number;
  lineTotalMinor: number;
  currency: string;
  packageBlockTitle?: string;
  billingKind?: "recurring" | "one_off";
}

export interface SignedAgreementPackageSnapshot {
  blockId: string;
  blockTitle: string;
  currency: string;
  tierName: string;
  termLabel: string;
  monthlyMinor: number;
  monthlyTotalMinor: number;
  upfrontMinor: number;
  oneOffAddonsMinor: number;
  addonLines: Array<{
    id: string;
    label: string;
    quantity: number;
    unitAmountMinor: number;
    lineTotalMinor: number;
    billingKind: "recurring" | "one_off";
  }>;
  stripePriceId?: string;
}

export interface SignedAgreementTotalAmount {
  currency: string;
  monthlyTotalMinor: number;
  formatted: string;
}

/**
 * Row in `signedAgreements` — written when a buyer signs via the Services Agreement modal.
 */
export interface SignedAgreementRecord {
  id: string;
  organizationId: string;
  proposalId: string;
  shareToken?: string;
  proposalTitle: string;
  /** Agreement block title at sign time — PDF title page (falls back to `proposalTitle`). */
  agreementTitle?: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  selectedPlan: string;
  addons: SignedAgreementAddonSnapshot[];
  /** Structured plan cards — mirrors buyer “Your selection” at sign time. */
  packageSnapshots?: SignedAgreementPackageSnapshot[];
  totalAmount: SignedAgreementTotalAmount;
  signerName: string;
  /** Email entered on the public Accept form (may differ from CRM recipient). */
  signerEmail?: string;
  /** Organization entered on the public Accept form (optional). */
  signerOrganization?: string;
  signatureMethod: "draw" | "type" | "upload" | null;
  signedAt: number;
  clientSignedAt?: number;
  /** Intro HTML snapshotted at sign time. */
  introHtmlSnapshot?: string;
  /** Legal HTML only — agreement PDF (excludes intro). Falls back to `fullAgreementText` on older rows. */
  legalHtmlSnapshot?: string;
  fullAgreementText?: string;
  /** Inline PNG data URL when Storage upload was skipped or failed (small images). */
  signatureImage?: string;
  /** Firebase Storage object path when upload succeeded. */
  signatureImageStoragePath?: string;
  /** Stripe Price id captured at sign time when configured on the selected tier or payment block. */
  stripeSubscriptionPriceId?: string | null;
}
