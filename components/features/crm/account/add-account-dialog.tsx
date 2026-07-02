"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { FormServerError } from "@/components/shared/form-server-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAccountFormSchema, type CreateAccountFormInput } from "@/lib/schemas/account";
import { createAccountAction } from "@/server/actions/accounts-crm";

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultValues: CreateAccountFormInput = {
  company: "",
  companyPhone: "",
  companyEmail: "",
  companyWebsite: "",
  companyAddressLine1: "",
  companyAddressLine2: "",
  companyCity: "",
  companyRegion: "",
  companyPostalCode: "",
  companyCountry: ""
};

export function AddAccountDialog({ open, onOpenChange }: AddAccountDialogProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<CreateAccountFormInput>({
    resolver: zodResolver(createAccountFormSchema),
    defaultValues
  });

  React.useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      setServerError(null);
    }
  }, [open, form]);

  async function onSubmit(values: CreateAccountFormInput) {
    setServerError(null);
    const result = await createAccountAction(values);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    onOpenChange(false);
    router.push(`/admin/accounts/${result.accountKey}`);
    router.refresh();
  }

  const busy = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>New account</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col gap-4" noValidate>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <FormServerError message={serverError} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="account-company">
                  Company name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="account-company"
                  autoComplete="organization"
                  placeholder="Company Name Pty Ltd"
                  {...form.register("company")}
                />
                {form.formState.errors.company ? (
                  <p className="text-destructive text-xs">{form.formState.errors.company.message}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="account-company-phone">Company phone</Label>
                <Input
                  id="account-company-phone"
                  type="tel"
                  autoComplete="off"
                  placeholder="+61 400 000 000"
                  {...form.register("companyPhone")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="account-company-email">Company email</Label>
                <Input
                  id="account-company-email"
                  type="email"
                  autoComplete="off"
                  placeholder="info@company.com"
                  {...form.register("companyEmail")}
                />
                {form.formState.errors.companyEmail ? (
                  <p className="text-destructive text-xs">{form.formState.errors.companyEmail.message}</p>
                ) : null}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="account-company-website">Company website</Label>
                <Input
                  id="account-company-website"
                  autoComplete="off"
                  placeholder="https://www.company.com"
                  {...form.register("companyWebsite")}
                />
                {form.formState.errors.companyWebsite ? (
                  <p className="text-destructive text-xs">{form.formState.errors.companyWebsite.message}</p>
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
