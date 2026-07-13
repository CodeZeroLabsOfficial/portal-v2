import Link from "next/link";
import { Building2, FileText, Globe, Mail, MapPin, Phone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAddressLines, websiteHref } from "@/lib/common/format";
import type { AccountRecord } from "@/types/account";

export interface CustomerCompanyDetailsCardProps {
  account: AccountRecord | null;
}

function EmptyValue() {
  return <span className="text-muted-foreground">—</span>;
}

export function CustomerCompanyDetailsCard({ account }: CustomerCompanyDetailsCardProps) {
  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Not linked to an account.</p>
        </CardContent>
      </Card>
    );
  }

  const companyName = account.company?.trim();
  const companyPhone = account.companyPhone?.trim();
  const companyEmail = account.companyEmail?.trim();
  const companyWebsite = account.companyWebsite?.trim();
  const companyAbn = account.companyAbn?.trim();
  const companyAcn = account.companyAcn?.trim();
  const addressLines = formatAddressLines({
    addressLine1: account.companyAddressLine1,
    addressLine2: account.companyAddressLine2,
    city: account.companyCity,
    region: account.companyRegion,
    postalCode: account.companyPostalCode,
    country: account.companyCountry,
  });
  const websiteUrl = companyWebsite ? websiteHref(companyWebsite) : "";
  const addressText = addressLines.length > 0 ? addressLines.join("\n") : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href={`/admin/accounts/${account.id}`} className="hover:underline">
            Company details
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Building2 className="text-muted-foreground size-4 shrink-0" aria-hidden />
            <Link href={`/admin/accounts/${account.id}`} className="hover:text-primary hover:underline">
              {companyName || <EmptyValue />}
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="text-muted-foreground size-4 shrink-0" aria-hidden />
            {companyPhone ? (
              <a href={`tel:${companyPhone}`} className="hover:text-primary hover:underline">
                {companyPhone}
              </a>
            ) : (
              <EmptyValue />
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="text-muted-foreground size-4 shrink-0" aria-hidden />
            {companyEmail ? (
              <a href={`mailto:${companyEmail}`} className="hover:text-primary hover:underline">
                {companyEmail}
              </a>
            ) : (
              <EmptyValue />
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Globe className="text-muted-foreground size-4 shrink-0" aria-hidden />
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
          </div>
          <div className="flex items-center gap-3 text-sm">
            <FileText className="text-muted-foreground size-4 shrink-0" aria-hidden />
            <span>
              ABN {companyAbn ? companyAbn : <span className="text-muted-foreground">—</span>}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <FileText className="text-muted-foreground size-4 shrink-0" aria-hidden />
            <span>
              ACN {companyAcn ? companyAcn : <span className="text-muted-foreground">—</span>}
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
            {addressText ? (
              <span className="whitespace-pre-line">{addressText}</span>
            ) : (
              <EmptyValue />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
