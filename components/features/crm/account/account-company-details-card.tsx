"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Building2, Globe, Mail, MapPin, Phone } from "lucide-react";
import { z } from "zod";

import { InlineEditableAddressFields } from "@/components/shared/inline-editable-address-fields";
import { InlineEditableField } from "@/components/shared/inline-editable-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildAccountUpdatePayload,
  type AccountInlineFieldOverrides
} from "@/lib/account/form-defaults";
import { normalizeAddressFields, type AddressFields } from "@/lib/common/format";
import { updateAccountAction } from "@/server/actions/accounts-crm";
import type { AccountDetailAggregate } from "@/server/firestore/crm-customers";

const detailLabelClass =
  "flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground";

const detailLabelIconClass = "size-3.5 shrink-0 opacity-80";

interface AccountCompanyDetailsCardProps {
  account: AccountDetailAggregate;
  accountKey: string;
}

export function AccountCompanyDetailsCard({ account, accountKey }: AccountCompanyDetailsCardProps) {
  const router = useRouter();
  const [activeFieldId, setActiveFieldId] = React.useState<string | null>(null);
  const companyAddress: AddressFields = normalizeAddressFields({
    addressLine1: account.companyAddressLine1,
    addressLine2: account.companyAddressLine2,
    city: account.companyCity,
    region: account.companyRegion,
    postalCode: account.companyPostalCode,
    country: account.companyCountry
  });

  async function persistField(
    overrides: AccountInlineFieldOverrides
  ): Promise<{ ok: boolean; message?: string }> {
    const res = await updateAccountAction(buildAccountUpdatePayload(account, accountKey, overrides));
    if (res.ok) {
      if (res.newAccountKey !== accountKey) {
        router.push(`/admin/accounts/${res.newAccountKey}`);
      } else {
        router.refresh();
      }
    }
    return res;
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="text-muted-foreground size-5" aria-hidden />
          Company details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-6 text-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <dt className={detailLabelClass}>
              <Phone className={detailLabelIconClass} aria-hidden />
              Company phone
            </dt>
            <dd>
              <InlineEditableField
                fieldId="companyPhone"
                activeFieldId={activeFieldId}
                onActiveFieldIdChange={setActiveFieldId}
                value={account.companyPhone}
                editLabel="company phone"
                placeholder="Phone number"
                onSave={async (next) => persistField({ companyPhone: next.trim() })}
              />
            </dd>
          </div>
          <div className="space-y-1">
            <dt className={detailLabelClass}>
              <Mail className={detailLabelIconClass} aria-hidden />
              Company email
            </dt>
            <dd>
              <InlineEditableField
                fieldId="companyEmail"
                activeFieldId={activeFieldId}
                onActiveFieldIdChange={setActiveFieldId}
                value={account.companyEmail}
                editLabel="company email"
                placeholder="info@company.com"
                onSave={async (next) => {
                  const trimmed = next.trim();
                  if (trimmed && !z.string().email().safeParse(trimmed).success) {
                    return { ok: false, message: "Enter a valid email address." };
                  }
                  if (trimmed.length > 320) {
                    return { ok: false, message: "Email must be 320 characters or fewer." };
                  }
                  return persistField({ companyEmail: trimmed });
                }}
              />
            </dd>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <dt className={detailLabelClass}>
              <Globe className={detailLabelIconClass} aria-hidden />
              Website
            </dt>
            <dd>
              <InlineEditableField
                fieldId="companyWebsite"
                activeFieldId={activeFieldId}
                onActiveFieldIdChange={setActiveFieldId}
                value={account.companyWebsite}
                editLabel="website"
                placeholder="https://www.company.com"
                onSave={async (next) => {
                  const trimmed = next.trim();
                  if (trimmed.length > 2048) {
                    return { ok: false, message: "Website must be at most 2048 characters." };
                  }
                  return persistField({ companyWebsite: trimmed });
                }}
              />
            </dd>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <dt className={detailLabelClass}>
              <MapPin className={detailLabelIconClass} aria-hidden />
              Company address
            </dt>
            <dd>
              <InlineEditableAddressFields
                fieldId="companyAddress"
                activeFieldId={activeFieldId}
                onActiveFieldIdChange={setActiveFieldId}
                value={companyAddress}
                editLabel="company address"
                onSave={async (next) => {
                  const normalized = normalizeAddressFields(next);
                  return persistField({
                    companyAddressLine1: normalized.addressLine1 ?? "",
                    companyAddressLine2: normalized.addressLine2 ?? "",
                    companyCity: normalized.city ?? "",
                    companyRegion: normalized.region ?? "",
                    companyPostalCode: normalized.postalCode ?? "",
                    companyCountry: normalized.country ?? ""
                  });
                }}
              />
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
