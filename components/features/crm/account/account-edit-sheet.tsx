"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  AccountFormFields,
  type AccountFormFieldsProps
} from "@/components/features/crm/account/account-form-fields";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormServerError } from "@/components/shared/form-server-error";
import {
  sheetActionsEndClass,
  sheetContentMediumClass,
  sheetFooterClass,
  sheetFormBodyClass,
  sheetFormClass,
  sheetFormFooterClass
} from "@/components/shared/sheet-layout";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { accountToFormDefaults } from "@/lib/account/form-defaults";
import { updateAccountFormSchema, type UpdateAccountFormInput } from "@/lib/schemas/account";
import { deleteAccountAction, updateAccountAction } from "@/server/actions/accounts-crm";
import type { AccountDetailAggregate } from "@/types/account";

export interface AccountEditSheetProps {
  account: AccountDetailAggregate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountEditSheet({ account, open, onOpenChange }: AccountEditSheetProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  const form = useForm<UpdateAccountFormInput>({
    resolver: zodResolver(updateAccountFormSchema),
    defaultValues: accountToFormDefaults(account)
  });

  React.useEffect(() => {
    if (!open) {
      setConfirmDeleteOpen(false);
      return;
    }
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

  async function handleDelete() {
    const result = await deleteAccountAction(account.id);
    if (!result.ok) {
      toast.error(result.message);
      throw new Error(result.message);
    }
    toast.success("Account deleted");
    onOpenChange(false);
    router.push("/admin/accounts");
    router.refresh();
  }

  const busy = form.formState.isSubmitting;
  const contactCount = account.contacts.length;
  const companyName = account.company.trim();
  const deleteDescription =
    contactCount > 0
      ? `Permanently delete ${companyName} and its ${contactCount} contact${contactCount === 1 ? "" : "s"}, including documents, proposals, opportunities, notes, tasks, invoices, and subscriptions? Open Stripe subscriptions must be canceled first. This cannot be undone.`
      : `Permanently delete ${companyName}? Related billing mirrors and documents (if any) will also be removed. This cannot be undone.`;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className={sheetContentMediumClass}>
          <SheetHeader>
            <SheetTitle>Edit account</SheetTitle>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className={sheetFormClass} noValidate>
            <div className={sheetFormBodyClass}>
              <FormServerError message={serverError} />
              <AccountFormFields
                form={form as unknown as AccountFormFieldsProps["form"]}
                idPrefix="edit-account"
                disabled={busy}
              />
            </div>
            <div className={sheetFormFooterClass}>
              <SheetFooter className={sheetFooterClass}>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={busy}
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  Delete
                </Button>
                <div className={sheetActionsEndClass}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={busy}
                  >
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
              </SheetFooter>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete account"
        description={deleteDescription}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}
