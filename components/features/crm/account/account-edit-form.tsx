"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { FormServerError } from "@/components/shared/form-server-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { accountToFormDefaults } from "@/lib/account/form-defaults";
import { updateAccountFormSchema, type UpdateAccountFormInput } from "@/lib/schemas/account";
import { updateAccountAction } from "@/server/actions/accounts-crm";
import type { AccountDetailAggregate } from "@/server/firestore/crm-customers";

interface AccountEditFormProps {
  account: AccountDetailAggregate;
  accountKey: string;
}

export function AccountEditForm({ account, accountKey }: AccountEditFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<UpdateAccountFormInput>({
    resolver: zodResolver(updateAccountFormSchema),
    defaultValues: accountToFormDefaults(account, accountKey)
  });

  React.useEffect(() => {
    form.reset(accountToFormDefaults(account, accountKey));
    setServerError(null);
  }, [account, accountKey, form]);

  async function onSubmit(values: UpdateAccountFormInput) {
    setServerError(null);
    const payload: UpdateAccountFormInput = { ...values, accountKey };
    const result = await updateAccountAction(payload);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    router.push(`/admin/accounts/${result.newAccountKey}`);
    router.refresh();
  }

  const busy = form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" asChild>
        <Link href={`/admin/accounts/${accountKey}`}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to account
        </Link>
      </Button>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Edit account</CardTitle>
          <CardDescription>
            Updates company name, address, and company contact fields on every CRM profile linked to
            this account ({account.contacts.length} contact
            {account.contacts.length === 1 ? "" : "s"}).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormServerError message={serverError} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-account-company">
                  Company name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-account-company"
                  placeholder="Company Name Pty Ltd"
                  {...form.register("company")}
                />
                {form.formState.errors.company ? (
                  <p className="text-destructive text-xs">{form.formState.errors.company.message}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-account-company-phone">Company phone</Label>
                <Input
                  id="edit-account-company-phone"
                  type="tel"
                  placeholder="+61 400 000 000"
                  {...form.register("companyPhone")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-account-company-email">Company email</Label>
                <Input
                  id="edit-account-company-email"
                  type="email"
                  autoComplete="off"
                  placeholder="info@company.com"
                  {...form.register("companyEmail")}
                />
                {form.formState.errors.companyEmail ? (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.companyEmail.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-account-company-website">Company website</Label>
                <Input
                  id="edit-account-company-website"
                  placeholder="https://www.company.com"
                  {...form.register("companyWebsite")}
                />
                {form.formState.errors.companyWebsite ? (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.companyWebsite.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Company address</Label>
              <Input placeholder="Line 1" {...form.register("companyAddressLine1")} />
              <Input placeholder="Line 2" {...form.register("companyAddressLine2")} />
              <div className="grid gap-1.5 sm:grid-cols-2">
                <Input placeholder="City" {...form.register("companyCity")} />
                <Input placeholder="State / region" {...form.register("companyRegion")} />
                <Input placeholder="Postal code" {...form.register("companyPostalCode")} />
                <Input placeholder="Country" {...form.register("companyCountry")} />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => router.push(`/admin/accounts/${accountKey}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
