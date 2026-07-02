import { Loader2, Mail, MapPin, Phone, Sparkles, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const addressText = addressLines.length > 0 ? addressLines.join("\n") : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact details</CardTitle>
        {customer.crmType === "lead" && onConvertLead ? (
          <CardAction>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1.5"
              disabled={convertLeadBusy}
              onClick={onConvertLead}>
              {convertLeadBusy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="size-4" aria-hidden />
              )}
              Convert lead
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Tag className="text-muted-foreground size-4 shrink-0" aria-hidden />
            <span>{name || <EmptyValue />}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="text-muted-foreground size-4 shrink-0" aria-hidden />
            {email ? (
              <a href={`mailto:${email}`} className="hover:text-primary hover:underline">
                {email}
              </a>
            ) : (
              <EmptyValue />
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="text-muted-foreground size-4 shrink-0" aria-hidden />
            {phone ? (
              <a href={`tel:${phone}`} className="hover:text-primary hover:underline">
                {phone}
              </a>
            ) : (
              <EmptyValue />
            )}
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
        {customer.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
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
