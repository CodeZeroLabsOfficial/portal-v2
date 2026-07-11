import { formatAddressLines, websiteHref } from "@/lib/common/format";
import type { AccountDetailAggregate } from "@/server/firestore/crm-customers";

interface AccountCompanyDetailsCardProps {
  account: AccountDetailAggregate;
}

function EmptyValue() {
  return <span className="text-muted-foreground">—</span>;
}

export function AccountCompanyDetailsCard({ account }: AccountCompanyDetailsCardProps) {
  const companyPhone = account.companyPhone?.trim();
  const companyEmail = account.companyEmail?.trim();
  const companyWebsite = account.companyWebsite?.trim();
  const websiteUrl = companyWebsite ? websiteHref(companyWebsite) : "";
  const addressLines = formatAddressLines({
    addressLine1: account.companyAddressLine1,
    addressLine2: account.companyAddressLine2,
    city: account.companyCity,
    region: account.companyRegion,
    postalCode: account.companyPostalCode,
    country: account.companyCountry
  });
  const addressText = addressLines.length > 0 ? addressLines.join("\n") : "";

  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-1">
        <dt className="text-muted-foreground text-sm">Company phone</dt>
        <dd className="font-medium">
          {companyPhone ? (
            <a href={`tel:${companyPhone}`} className="hover:text-primary hover:underline">
              {companyPhone}
            </a>
          ) : (
            <EmptyValue />
          )}
        </dd>
      </div>
      <div className="space-y-1">
        <dt className="text-muted-foreground text-sm">Company email</dt>
        <dd className="font-medium">
          {companyEmail ? (
            <a href={`mailto:${companyEmail}`} className="hover:text-primary hover:underline">
              {companyEmail}
            </a>
          ) : (
            <EmptyValue />
          )}
        </dd>
      </div>
      <div className="space-y-1">
        <dt className="text-muted-foreground text-sm">Website</dt>
        <dd className="font-medium">
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
        </dd>
      </div>
      <div className="space-y-1 sm:col-span-2 lg:col-span-3">
        <dt className="text-muted-foreground text-sm">Company address</dt>
        <dd className="font-medium">
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
