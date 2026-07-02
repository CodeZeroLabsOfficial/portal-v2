"use client";

import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerProfileFormValues } from "@/lib/customer/profile-form-values";

export type { CustomerProfileFormValues };

export interface CustomerProfileFormFieldsProps {
  form: UseFormReturn<CustomerProfileFormValues>;
  disabled?: boolean;
  mode: "create" | "edit";
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  tagInput: string;
  onTagInputChange: (value: string) => void;
}

export function CustomerProfileFormFields({
  form,
  disabled = false,
  mode,
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  tagInput,
  onTagInputChange
}: CustomerProfileFormFieldsProps) {
  const { register, formState, watch, setValue, getValues } = form;
  const errors = formState.errors;
  const saveAsLead = watch("saveAsLead");

  function copyCompanyAddressToContact() {
    const values = getValues();
    const opts = { shouldDirty: true, shouldTouch: true };
    setValue("addressLine1", values.companyAddressLine1 ?? "", opts);
    setValue("addressLine2", values.companyAddressLine2 ?? "", opts);
    setValue("city", values.companyCity ?? "", opts);
    setValue("region", values.companyRegion ?? "", opts);
    setValue("postalCode", values.companyPostalCode ?? "", opts);
    setValue("country", values.companyCountry ?? "", opts);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Contact</h3>
        <input type="hidden" {...register("name")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="crm-first-name">First name</Label>
            {mode === "create" ? (
              <div className="flex overflow-hidden rounded-md border">
                <select
                  id="crm-record-type"
                  className="h-9 appearance-none border-r bg-transparent py-1 pl-3 pr-7 text-sm focus-visible:outline-none"
                  value={saveAsLead ? "lead" : "contact"}
                  disabled={disabled}
                  aria-label="Record type"
                  onChange={(e) =>
                    setValue("saveAsLead", e.target.value === "lead", { shouldDirty: true })
                  }>
                  <option value="contact">Contact</option>
                  <option value="lead">Lead</option>
                </select>
                <Input
                  id="crm-first-name"
                  autoComplete="given-name"
                  className="h-9 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0"
                  placeholder="John"
                  value={firstName}
                  disabled={disabled}
                  onChange={(e) => onFirstNameChange(e.target.value)}
                />
              </div>
            ) : (
              <Input
                id="crm-first-name"
                autoComplete="given-name"
                placeholder="John"
                value={firstName}
                disabled={disabled}
                onChange={(e) => onFirstNameChange(e.target.value)}
              />
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crm-last-name">Last name</Label>
            <Input
              id="crm-last-name"
              autoComplete="family-name"
              placeholder="Smith"
              value={lastName}
              disabled={disabled}
              onChange={(e) => onLastNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crm-email">Email *</Label>
            <Input
              id="crm-email"
              type="email"
              autoComplete="email"
              disabled={disabled}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crm-phone">Phone</Label>
            <Input
              id="crm-phone"
              type="tel"
              autoComplete="tel"
              disabled={disabled}
              {...register("phone")}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Contact address</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={copyCompanyAddressToContact}
              disabled={disabled}>
              Copy from company
            </Button>
          </div>
          <Input
            placeholder="Line 1"
            autoComplete="address-line1"
            disabled={disabled}
            {...register("addressLine1")}
          />
          <Input
            placeholder="Line 2"
            autoComplete="address-line2"
            disabled={disabled}
            {...register("addressLine2")}
          />
          <div className="grid grid-cols-2 gap-1.5">
            <Input
              placeholder="City"
              autoComplete="address-level2"
              disabled={disabled}
              {...register("city")}
            />
            <Input
              placeholder="State / region"
              autoComplete="address-level1"
              disabled={disabled}
              {...register("region")}
            />
            <Input
              placeholder="Postal code"
              autoComplete="postal-code"
              disabled={disabled}
              {...register("postalCode")}
            />
            <Input
              placeholder="Country"
              autoComplete="country-name"
              disabled={disabled}
              {...register("country")}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="crm-tags">Tags</Label>
          <Input
            id="crm-tags"
            value={tagInput}
            disabled={disabled}
            onChange={(e) => onTagInputChange(e.target.value)}
            placeholder="vip, priority — comma separated"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Company</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="crm-company">Company name</Label>
            <Input
              id="crm-company"
              autoComplete="organization"
              disabled={disabled}
              {...register("company")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crm-company-phone">Company phone</Label>
            <Input
              id="crm-company-phone"
              type="tel"
              autoComplete="tel"
              disabled={disabled}
              {...register("companyPhone")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crm-company-email">Company email</Label>
            <Input
              id="crm-company-email"
              type="email"
              disabled={disabled}
              {...register("companyEmail")}
            />
            {errors.companyEmail ? (
              <p className="text-destructive text-xs">{errors.companyEmail.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="crm-company-website">Website</Label>
            <Input
              id="crm-company-website"
              autoComplete="url"
              placeholder="https://www.company.com"
              disabled={disabled}
              {...register("companyWebsite")}
            />
            {errors.companyWebsite ? (
              <p className="text-destructive text-xs">{errors.companyWebsite.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crm-company-abn">ABN</Label>
            <Input id="crm-company-abn" autoComplete="off" disabled={disabled} {...register("companyAbn")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crm-company-acn">ACN</Label>
            <Input id="crm-company-acn" autoComplete="off" disabled={disabled} {...register("companyAcn")} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Company address</Label>
          <Input placeholder="Line 1" disabled={disabled} {...register("companyAddressLine1")} />
          <Input placeholder="Line 2" disabled={disabled} {...register("companyAddressLine2")} />
          <div className="grid grid-cols-2 gap-1.5">
            <Input placeholder="City" disabled={disabled} {...register("companyCity")} />
            <Input placeholder="State / region" disabled={disabled} {...register("companyRegion")} />
            <Input placeholder="Postal code" disabled={disabled} {...register("companyPostalCode")} />
            <Input placeholder="Country" disabled={disabled} {...register("companyCountry")} />
          </div>
        </div>
      </div>
    </div>
  );
}
