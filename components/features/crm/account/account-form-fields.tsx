"use client";

import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateAccountFormInput } from "@/lib/schemas/account";

export interface AccountFormFieldsProps {
  form: Pick<UseFormReturn<CreateAccountFormInput>, "register" | "formState">;
  idPrefix: string;
  disabled?: boolean;
}

export function AccountFormFields({ form, idPrefix, disabled }: AccountFormFieldsProps) {
  const { errors } = form.formState;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-company`}>
            Company name <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${idPrefix}-company`}
            autoComplete="organization"
            placeholder="Company Name Pty Ltd"
            disabled={disabled}
            {...form.register("company")}
          />
          {errors.company ? (
            <p className="text-destructive text-xs">{errors.company.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-company-phone`}>Company phone</Label>
          <Input
            id={`${idPrefix}-company-phone`}
            type="tel"
            autoComplete="off"
            placeholder="+61 400 000 000"
            disabled={disabled}
            {...form.register("companyPhone")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-company-email`}>Company email</Label>
          <Input
            id={`${idPrefix}-company-email`}
            type="email"
            autoComplete="off"
            placeholder="info@company.com"
            disabled={disabled}
            {...form.register("companyEmail")}
          />
          {errors.companyEmail ? (
            <p className="text-destructive text-xs">{errors.companyEmail.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-company-website`}>Website</Label>
          <Input
            id={`${idPrefix}-company-website`}
            autoComplete="off"
            placeholder="https://www.company.com"
            disabled={disabled}
            {...form.register("companyWebsite")}
          />
          {errors.companyWebsite ? (
            <p className="text-destructive text-xs">{errors.companyWebsite.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-company-abn`}>ABN</Label>
          <Input
            id={`${idPrefix}-company-abn`}
            autoComplete="off"
            disabled={disabled}
            {...form.register("companyAbn")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-company-acn`}>ACN</Label>
          <Input
            id={`${idPrefix}-company-acn`}
            autoComplete="off"
            disabled={disabled}
            {...form.register("companyAcn")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Address</Label>
        <Input placeholder="Line 1" disabled={disabled} {...form.register("companyAddressLine1")} />
        <Input placeholder="Line 2" disabled={disabled} {...form.register("companyAddressLine2")} />
        <div className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="City" disabled={disabled} {...form.register("companyCity")} />
          <Input placeholder="State / region" disabled={disabled} {...form.register("companyRegion")} />
          <Input placeholder="Postal code" disabled={disabled} {...form.register("companyPostalCode")} />
          <Input placeholder="Country" disabled={disabled} {...form.register("companyCountry")} />
        </div>
      </div>
    </>
  );
}
