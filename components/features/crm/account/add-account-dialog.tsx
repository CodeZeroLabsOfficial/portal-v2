"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { AccountFormFields } from "@/components/features/crm/account/account-form-fields";
import { FormServerError } from "@/components/shared/form-server-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
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
  companyAbn: "",
  companyAcn: "",
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
            <AccountFormFields form={form} idPrefix="account" disabled={busy} />
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
