import type { ReactNode } from "react";

import { formatAddressLines, websiteHref } from "@/lib/common/format";
import type { AccountRecord } from "@/types/account";

interface AccountReadonlySummaryProps {
  account: AccountRecord | null;
  emptyMessage?: string;
}

function EmptyValue() {
  return <span className="text-muted-foreground">—</span>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

/** Read-only company fields for pickers (e.g. Add Customer → existing account). */
export function AccountReadonlySummary({
  account,
  emptyMessage = "Select an account to preview company details.",
}: AccountReadonlySummaryProps) {
  if (!account) {
    return <p className="text-muted-foreground text-sm">{emptyMessage}</p>;
  }

  const companyPhone = account.companyPhone?.trim();
  const companyEmail = account.companyEmail?.trim();
  const companyWebsite = account.companyWebsite?.trim();
  const companyAbn = account.companyAbn?.trim();
  const companyAcn = account.companyAcn?.trim();
  const websiteUrl = companyWebsite ? websiteHref(companyWebsite) : "";
  const addressText = formatAddressLines({
    addressLine1: account.companyAddressLine1,
    addressLine2: account.companyAddressLine2,
    city: account.companyCity,
    region: account.companyRegion,
    postalCode: account.companyPostalCode,
    country: account.companyCountry,
  }).join("\n");

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      <Field label="Company name">
        {account.company.trim() || <EmptyValue />}
      </Field>
      <Field label="Company phone">
        {companyPhone ? (
          <a href={`tel:${companyPhone}`} className="hover:text-primary hover:underline">
            {companyPhone}
          </a>
        ) : (
          <EmptyValue />
        )}
      </Field>
      <Field label="Company email">
        {companyEmail ? (
          <a href={`mailto:${companyEmail}`} className="hover:text-primary hover:underline">
            {companyEmail}
          </a>
        ) : (
          <EmptyValue />
        )}
      </Field>
      <Field label="Website">
        {companyWebsite && websiteUrl ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary hover:underline">
            {companyWebsite}
          </a>
        ) : (
          <EmptyValue />
        )}
      </Field>
      <Field label="ABN">{companyAbn || <EmptyValue />}</Field>
      <Field label="ACN">{companyAcn || <EmptyValue />}</Field>
      <div className="space-y-1 sm:col-span-2">
        <dt className="text-muted-foreground text-sm">Address</dt>
        <dd className="text-sm font-medium">
          {addressText ? (
            <span className="whitespace-pre-line">{addressText}</span>
          ) : (
            <EmptyValue />
          )}
        </dd>
      </div>
    </dl>
  );
}
