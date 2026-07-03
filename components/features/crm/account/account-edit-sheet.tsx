"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AccountFormFields, type AccountFormFieldsProps } from "@/components/features/crm/account/account-form-fields";
import { FormServerError } from "@/components/shared/form-server-error";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { accountToFormDefaults } from "@/lib/account/form-defaults";
import { updateAccountFormSchema, type UpdateAccountFormInput } from "@/lib/schemas/account";
import { updateAccountAction } from "@/server/actions/accounts-crm";
import type { AccountDetailAggregate } from "@/server/firestore/crm-customers";

export interface AccountEditSheetProps {
  account: AccountDetailAggregate;
  accountKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountEditSheet({
  account,
  accountKey,
  open,
  onOpenChange
}: AccountEditSheetProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<UpdateAccountFormInput>({
    resolver: zodResolver(updateAccountFormSchema),
    defaultValues: accountToFormDefaults(account, accountKey)
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(accountToFormDefaults(account, accountKey));
    setServerError(null);
  }, [open, account, accountKey, form]);

  async function onSubmit(values: UpdateAccountFormInput) {
    setServerError(null);
    const result = await updateAccountAction({ ...values, accountKey });
    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    toast.success("Account saved");
    onOpenChange(false);
    router.refresh();
  }

  const busy = form.formState.isSubmitting;
  const contactCount = account.contacts.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Edit account</SheetTitle>
          <SheetDescription>
            Updates company details on every CRM profile linked to this account ({contactCount}{" "}
            contact{contactCount === 1 ? "" : "s"}).
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4 px-4" noValidate>
          <FormServerError message={serverError} />
          <AccountFormFields
            form={form as unknown as AccountFormFieldsProps["form"]}
            idPrefix="edit-account"
            disabled={busy}
          />
          <SheetFooter className="px-0">
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
