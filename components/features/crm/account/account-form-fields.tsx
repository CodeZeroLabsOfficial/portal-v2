"use client";

import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CreateAccountFormInput } from "@/lib/schemas/account";

export interface AccountFormFieldsProps {
  form: Pick<UseFormReturn<CreateAccountFormInput>, "register" | "formState">;
  idPrefix: string;
  disabled?: boolean;
  /** `split` = company left, address right (add-customer dialog). Default stacked. */
  layout?: "stacked" | "split";
}

export function AccountFormFields({
  form,
  idPrefix,
  disabled,
  layout = "stacked",
}: AccountFormFieldsProps) {
  const { errors } = form.formState;
  const split = layout === "split";
  const companyInvalid = Boolean(errors.company);
  const companyEmailInvalid = Boolean(errors.companyEmail);
  const companyWebsiteInvalid = Boolean(errors.companyWebsite);

  const companyFields = (
    <div className={cn("grid gap-4", !split && "sm:grid-cols-2")}>
      <div className={cn("space-y-2", !split && "sm:col-span-2")}>
        <Label htmlFor={`${idPrefix}-company`}>
          Company name <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${idPrefix}-company`}
          autoComplete="organization"
          placeholder="Company Name Pty Ltd"
          disabled={disabled}
          aria-invalid={companyInvalid}
          {...form.register("company")}
        />
        {errors.company ? (
          <p aria-live="polite" role="alert" className="text-destructive mt-2 text-xs">
            {errors.company.message}
          </p>
        ) : null}
      </div>

      <div className={cn("grid gap-4", split ? "sm:grid-cols-2" : "contents")}>
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
            aria-invalid={companyEmailInvalid}
            {...form.register("companyEmail")}
          />
          {errors.companyEmail ? (
            <p aria-live="polite" role="alert" className="text-destructive mt-2 text-xs">
              {errors.companyEmail.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className={cn("space-y-2", !split && "sm:col-span-2")}>
        <Label htmlFor={`${idPrefix}-company-website`}>Website</Label>
        <Input
          id={`${idPrefix}-company-website`}
          autoComplete="off"
          placeholder="https://www.company.com"
          disabled={disabled}
          aria-invalid={companyWebsiteInvalid}
          {...form.register("companyWebsite")}
        />
        {errors.companyWebsite ? (
          <p aria-live="polite" role="alert" className="text-destructive mt-2 text-xs">
            {errors.companyWebsite.message}
          </p>
        ) : null}
      </div>

      <div className={cn("grid gap-4", split ? "sm:grid-cols-2" : "contents")}>
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
    </div>
  );

  if (split) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-medium">Company details</p>
          {companyFields}
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium">Address</p>
          <div className="grid gap-4 content-start">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-address-line1`}>Line 1</Label>
              <Input
                id={`${idPrefix}-address-line1`}
                placeholder="Line 1"
                disabled={disabled}
                {...form.register("companyAddressLine1")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-address-line2`}>Line 2</Label>
              <Input
                id={`${idPrefix}-address-line2`}
                placeholder="Line 2"
                disabled={disabled}
                {...form.register("companyAddressLine2")}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${idPrefix}-city`}>City</Label>
                <Input
                  id={`${idPrefix}-city`}
                  placeholder="City"
                  disabled={disabled}
                  {...form.register("companyCity")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idPrefix}-region`}>State / region</Label>
                <Input
                  id={`${idPrefix}-region`}
                  placeholder="State / region"
                  disabled={disabled}
                  {...form.register("companyRegion")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idPrefix}-postal`}>Postal code</Label>
                <Input
                  id={`${idPrefix}-postal`}
                  placeholder="Postal code"
                  disabled={disabled}
                  {...form.register("companyPostalCode")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idPrefix}-country`}>Country</Label>
                <Input
                  id={`${idPrefix}-country`}
                  placeholder="Country"
                  disabled={disabled}
                  {...form.register("companyCountry")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {companyFields}
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
