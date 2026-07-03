"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { CustomerProfileFormFields } from "@/components/features/crm/customer/customer-profile-form-fields";
import { FormServerError } from "@/components/shared/form-server-error";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { combineCustomerName } from "@/lib/customer/name-split";
import {
  EMPTY_CUSTOMER_PROFILE_FORM_VALUES,
  type CustomerProfileFormValues
} from "@/lib/customer/profile-form-values";
import { parseCustomerTagsInput } from "@/lib/customer/tags";
import { normalizeAddressFields } from "@/lib/common/format";
import { createCustomerSchema } from "@/lib/schemas/customer";
import { createCustomerAction } from "@/server/actions/customers-crm";

export interface AddCustomerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultValues: CustomerProfileFormValues = {
  ...EMPTY_CUSTOMER_PROFILE_FORM_VALUES
};

export function AddCustomerSheet({ open, onOpenChange }: AddCustomerSheetProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [tagInput, setTagInput] = React.useState("");

  const form = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues
  });

  React.useEffect(() => {
    if (open) return;
    form.reset(defaultValues);
    setFirstName("");
    setLastName("");
    setTagInput("");
    setServerError(null);
  }, [open, form]);

  React.useEffect(() => {
    form.setValue("name", combineCustomerName(firstName, lastName), {
      shouldValidate: true,
      shouldDirty: false
    });
  }, [firstName, lastName, form]);

  async function onSubmit(values: CustomerProfileFormValues) {
    setServerError(null);
    const tags = parseCustomerTagsInput(tagInput);
    const contactAddress = normalizeAddressFields({
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      city: values.city,
      region: values.region,
      postalCode: values.postalCode,
      country: values.country
    });
    const { id: _id, ...createPayload } = values;
    const result = await createCustomerAction({ ...createPayload, ...contactAddress, tags });
    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    toast.success("Customer created");
    onOpenChange(false);
    router.push(`/admin/customers/${result.customerId}`);
    router.refresh();
  }

  const busy = form.formState.isSubmitting;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Add customer</SheetTitle>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4 px-4" noValidate>
          <FormServerError message={serverError} />
          <CustomerProfileFormFields
            form={form}
            mode="create"
            disabled={busy}
            firstName={firstName}
            lastName={lastName}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            tagInput={tagInput}
            onTagInputChange={setTagInput}
          />
          <SheetFooter className="px-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Creating…
                </>
              ) : (
                "Create"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
