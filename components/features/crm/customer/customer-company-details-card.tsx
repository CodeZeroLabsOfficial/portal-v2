import { Building2, FileText, Globe, Mail, MapPin, Phone } from "lucide-react";

import { CrmDetailLabel, CrmDetailValue } from "@/components/shared/crm-detail-label";
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

  return (
    <Card className="border-border/80 bg-card/80 shadow-sm">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="text-muted-foreground size-5" aria-hidden />
          Company details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-6 text-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <CrmDetailLabel icon={Building2}>Company name</CrmDetailLabel>
            <CrmDetailValue empty={!companyName}>{companyName || <EmptyValue />}</CrmDetailValue>
          </div>
          <div className="space-y-1">
            <CrmDetailLabel icon={Phone}>Company phone</CrmDetailLabel>
            <CrmDetailValue empty={!companyPhone}>
              {companyPhone ? (
                <a href={`tel:${companyPhone}`} className="hover:text-primary hover:underline">
                  {companyPhone}
                </a>
              ) : (
                <EmptyValue />
              )}
            </CrmDetailValue>
          </div>
          <div className="space-y-1">
            <CrmDetailLabel icon={Mail}>Company email</CrmDetailLabel>
            <CrmDetailValue empty={!companyEmail}>
              {companyEmail ? (
                <a href={`mailto:${companyEmail}`} className="hover:text-primary hover:underline">
                  {companyEmail}
                </a>
              ) : (
                <EmptyValue />
              )}
            </CrmDetailValue>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <CrmDetailLabel icon={Globe}>Website</CrmDetailLabel>
            <CrmDetailValue empty={!companyWebsite}>
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
            </CrmDetailValue>
          </div>
          <div className="space-y-1">
            <CrmDetailLabel icon={FileText}>ABN</CrmDetailLabel>
            <CrmDetailValue empty={!companyAbn}>{companyAbn || <EmptyValue />}</CrmDetailValue>
          </div>
          <div className="space-y-1">
            <CrmDetailLabel icon={FileText}>ACN</CrmDetailLabel>
            <CrmDetailValue empty={!companyAcn}>{companyAcn || <EmptyValue />}</CrmDetailValue>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <CrmDetailLabel icon={MapPin}>Company address</CrmDetailLabel>
            <CrmDetailValue empty={addressLines.length === 0}>
              {addressLines.length > 0 ? (
                <span className="whitespace-pre-line">{addressLines.join("\n")}</span>
              ) : (
                <EmptyValue />
              )}
            </CrmDetailValue>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
