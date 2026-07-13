"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerProfileFormValues } from "@/lib/customer/profile-form-values";
import { listAccountsForPickerAction } from "@/server/actions/accounts-crm";
import type { AccountRecord } from "@/types/account";

export type { CustomerProfileFormValues };

export interface CustomerProfileFormFieldsProps {
  form: UseFormReturn<CustomerProfileFormValues>;
  disabled?: boolean;
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  tagInput?: string;
  onTagInputChange?: (value: string) => void;
  showTags?: boolean;
}

/** Profile fields for the customer edit sheet (create uses {@link AddCustomerDialog}). */
export function CustomerProfileFormFields({
  form,
  disabled = false,
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  tagInput = "",
  onTagInputChange,
  showTags = true,
}: CustomerProfileFormFieldsProps) {
  const { register, formState, watch, setValue } = form;
  const errors = formState.errors;
  const accountId = watch("accountId");
  const [accounts, setAccounts] = React.useState<AccountRecord[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    void listAccountsForPickerAction().then((res) => {
      if (cancelled || !res.ok) return;
      setAccounts(res.accounts);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedAccount = React.useMemo(
    () => accounts.find((a) => a.id === accountId?.trim()) ?? null,
    [accounts, accountId],
  );

  function copyAccountAddressToContact() {
    if (!selectedAccount) return;
    const opts = { shouldDirty: true, shouldTouch: true };
    setValue("addressLine1", selectedAccount.companyAddressLine1 ?? "", opts);
    setValue("addressLine2", selectedAccount.companyAddressLine2 ?? "", opts);
    setValue("city", selectedAccount.companyCity ?? "", opts);
    setValue("region", selectedAccount.companyRegion ?? "", opts);
    setValue("postalCode", selectedAccount.companyPostalCode ?? "", opts);
    setValue("country", selectedAccount.companyCountry ?? "", opts);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <input type="hidden" {...register("name")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="crm-first-name">First name</Label>
            <Input
              id="crm-first-name"
              autoComplete="given-name"
              placeholder="John"
              value={firstName}
              disabled={disabled}
              onChange={(e) => onFirstNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
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

        <div className="space-y-2">
          <Label htmlFor="crm-account">Account</Label>
          <select
            id="crm-account"
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            disabled={disabled}
            value={accountId ?? ""}
            onChange={(e) =>
              setValue("accountId", e.target.value, { shouldDirty: true, shouldTouch: true })
            }>
            <option value="">No account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.company}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Contact address</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={copyAccountAddressToContact}
              disabled={disabled || !selectedAccount}>
              Copy from account
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
          <div className="grid gap-2 sm:grid-cols-2">
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

        {showTags && onTagInputChange ? (
          <div className="space-y-2">
            <Label htmlFor="crm-tags">Tags</Label>
            <Input
              id="crm-tags"
              value={tagInput}
              disabled={disabled}
              onChange={(e) => onTagInputChange(e.target.value)}
              placeholder="vip, priority — comma separated"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
