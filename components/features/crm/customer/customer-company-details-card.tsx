import { Building2, FileText, Globe, Mail, MapPin, Phone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAddressLines, websiteHref } from "@/lib/common/format";
import type { CustomerRecord } from "@/types/customer";

export interface CustomerCompanyDetailsCardProps {
  customer: CustomerRecord;
}

function EmptyValue() {
  return <span className="text-muted-foreground">—</span>;
}

export function CustomerCompanyDetailsCard({ customer }: CustomerCompanyDetailsCardProps) {
  const companyName = customer.company?.trim();
  const companyPhone = customer.companyPhone?.trim();
  const companyEmail = customer.companyEmail?.trim();
  const companyWebsite = customer.companyWebsite?.trim();
  const companyAbn = customer.companyAbn?.trim();
  const companyAcn = customer.companyAcn?.trim();
  const addressLines = formatAddressLines({
    addressLine1: customer.companyAddressLine1,
    addressLine2: customer.companyAddressLine2,
    city: customer.companyCity,
    region: customer.companyRegion,
    postalCode: customer.companyPostalCode,
    country: customer.companyCountry
  });
  const websiteUrl = companyWebsite ? websiteHref(companyWebsite) : "";
  const addressText = addressLines.length > 0 ? addressLines.join("\n") : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Building2 className="text-muted-foreground size-4 shrink-0" aria-hidden />
            <span>{companyName || <EmptyValue />}</span>
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
              ABN{" "}
              {companyAbn ? (
                companyAbn
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <FileText className="text-muted-foreground size-4 shrink-0" aria-hidden />
            <span>
              ACN{" "}
              {companyAcn ? (
                companyAcn
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
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
