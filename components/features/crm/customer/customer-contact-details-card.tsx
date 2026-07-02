import { Loader2, Mail, MapPin, Phone, Sparkles, Tag, Users } from "lucide-react";

import { CrmDetailLabel, CrmDetailValue } from "@/components/shared/crm-detail-label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAddressLines } from "@/lib/common/format";
import type { CustomerRecord } from "@/types/customer";

export interface CustomerContactDetailsCardProps {
  customer: CustomerRecord;
  convertLeadBusy?: boolean;
  onConvertLead?: () => void;
}

function EmptyValue() {
  return <span className="text-muted-foreground">—</span>;
}

export function CustomerContactDetailsCard({
  customer,
  convertLeadBusy = false,
  onConvertLead
}: CustomerContactDetailsCardProps) {
  const name = customer.name?.trim();
  const email = customer.email?.trim();
  const phone = customer.phone?.trim();
  const addressLines = formatAddressLines({
    addressLine1: customer.addressLine1,
    addressLine2: customer.addressLine2,
    city: customer.city,
    region: customer.region,
    postalCode: customer.postalCode,
    country: customer.country
  });

  return (
    <Card className="border-border/80 bg-card/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-border/60 bg-muted/20">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="text-muted-foreground size-5" aria-hidden />
          Contact details
        </CardTitle>
        {customer.crmType === "lead" && onConvertLead ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground shrink-0 gap-1.5"
            disabled={convertLeadBusy}
            onClick={onConvertLead}>
            {convertLeadBusy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="size-4" aria-hidden />
            )}
            Convert lead
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5 p-6 text-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <CrmDetailLabel icon={Tag}>Name</CrmDetailLabel>
            <CrmDetailValue empty={!name}>{name || <EmptyValue />}</CrmDetailValue>
          </div>
          <div className="space-y-1">
            <CrmDetailLabel icon={Mail}>Email</CrmDetailLabel>
            <CrmDetailValue empty={!email}>
              {email ? (
                <a href={`mailto:${email}`} className="hover:text-primary hover:underline">
                  {email}
                </a>
              ) : (
                <EmptyValue />
              )}
            </CrmDetailValue>
          </div>
          <div className="space-y-1">
            <CrmDetailLabel icon={Phone}>Phone</CrmDetailLabel>
            <CrmDetailValue empty={!phone}>
              {phone ? (
                <a href={`tel:${phone}`} className="hover:text-primary hover:underline">
                  {phone}
                </a>
              ) : (
                <EmptyValue />
              )}
            </CrmDetailValue>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <CrmDetailLabel icon={MapPin}>Address</CrmDetailLabel>
            <CrmDetailValue empty={addressLines.length === 0}>
              {addressLines.length > 0 ? (
                <span className="whitespace-pre-line">{addressLines.join("\n")}</span>
              ) : (
                <EmptyValue />
              )}
            </CrmDetailValue>
          </div>
        </dl>
        {customer.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {customer.tags.map((tag) => (
              <span
                key={tag}
                className="border-border/60 bg-background/60 rounded-full border px-2.5 py-0.5 text-xs font-medium text-foreground/90">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
