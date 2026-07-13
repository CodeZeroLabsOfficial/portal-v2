"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AccountFormFields, type AccountFormFieldsProps } from "@/components/features/crm/account/account-form-fields";
import { FormServerError } from "@/components/shared/form-server-error";
import {
  sheetActionsEndClass,
  sheetContentMediumClass,
  sheetFormClass,
} from "@/components/shared/sheet-layout";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { accountToFormDefaults } from "@/lib/account/form-defaults";
import { updateAccountFormSchema, type UpdateAccountFormInput } from "@/lib/schemas/account";
import { updateAccountAction } from "@/server/actions/accounts-crm";
import type { AccountDetailAggregate } from "@/types/account";

export interface AccountEditSheetProps {
  account: AccountDetailAggregate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountEditSheet({ account, open, onOpenChange }: AccountEditSheetProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<UpdateAccountFormInput>({
    resolver: zodResolver(updateAccountFormSchema),
    defaultValues: accountToFormDefaults(account),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(accountToFormDefaults(account));
    setServerError(null);
  }, [open, account, form]);

  async function onSubmit(values: UpdateAccountFormInput) {
    setServerError(null);
    const result = await updateAccountAction({ ...values, id: account.id });
    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    toast.success("Account saved");
    onOpenChange(false);
    router.refresh();
  }

  const busy = form.formState.isSubmitting;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={sheetContentMediumClass}>
        <SheetHeader>
          <SheetTitle>Edit account</SheetTitle>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className={sheetFormClass} noValidate>
          <FormServerError message={serverError} />
          <AccountFormFields
            form={form as unknown as AccountFormFieldsProps["form"]}
            idPrefix="edit-account"
            disabled={busy}
          />
          <div className={sheetActionsEndClass}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
