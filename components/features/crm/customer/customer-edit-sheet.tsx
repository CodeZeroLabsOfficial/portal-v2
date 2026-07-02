"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { CustomerProfileFormFields } from "@/components/features/crm/customer/customer-profile-form-fields";
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
import { customerToFormDefaults } from "@/lib/customer/form-defaults";
import { combineCustomerName, splitCustomerName } from "@/lib/customer/name-split";
import type { CustomerProfileFormValues } from "@/lib/customer/profile-form-values";
import { normalizeAddressFields } from "@/lib/common/format";
import { updateCustomerFormSchema } from "@/lib/schemas/customer";
import { updateCustomerAction } from "@/server/actions/customers-crm";
import type { CustomerRecord } from "@/types/customer";

export interface CustomerEditSheetProps {
  customer: CustomerRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function tagsToInput(tags: string[]): string {
  return tags.join(", ");
}

function parseTagsInput(raw: string): string[] {
  return raw
    .split(/[,;]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function CustomerEditSheet({ customer, open, onOpenChange }: CustomerEditSheetProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [tagInput, setTagInput] = React.useState("");

  const fieldsDisabled = customer.status === "archived";

  const form = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(updateCustomerFormSchema) as Resolver<CustomerProfileFormValues>,
    defaultValues: customerToFormDefaults(customer) as CustomerProfileFormValues
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(customerToFormDefaults(customer));
    const { firstName: first, lastName: last } = splitCustomerName(customer.name);
    setFirstName(first);
    setLastName(last);
    setTagInput(tagsToInput(customer.tags));
    setServerError(null);
  }, [open, customer, form]);

  React.useEffect(() => {
    const combined = combineCustomerName(firstName, lastName);
    form.setValue("name", combined, { shouldValidate: true, shouldDirty: true });
  }, [firstName, lastName, form]);

  async function onSubmit(values: CustomerProfileFormValues) {
    setServerError(null);
    const tags = parseTagsInput(tagInput);
    const contactAddress = normalizeAddressFields({
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      city: values.city,
      region: values.region,
      postalCode: values.postalCode,
      country: values.country
    });
    const companyAddress = normalizeAddressFields({
      addressLine1: values.companyAddressLine1,
      addressLine2: values.companyAddressLine2,
      city: values.companyCity,
      region: values.companyRegion,
      postalCode: values.companyPostalCode,
      country: values.companyCountry
    });

    const result = await updateCustomerAction({
      ...values,
      ...contactAddress,
      companyAddressLine1: companyAddress.addressLine1 ?? "",
      companyAddressLine2: companyAddress.addressLine2 ?? "",
      companyCity: companyAddress.city ?? "",
      companyRegion: companyAddress.region ?? "",
      companyPostalCode: companyAddress.postalCode ?? "",
      companyCountry: companyAddress.country ?? "",
      tags,
      id: customer.id
    });

    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    toast.success("Customer saved");
    onOpenChange(false);
    router.refresh();
  }

  const busy = form.formState.isSubmitting;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Edit customer</SheetTitle>
          <SheetDescription>{customer.email}</SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4 px-4" noValidate>
          <FormServerError message={serverError} />
          <CustomerProfileFormFields
            form={form}
            mode="edit"
            disabled={fieldsDisabled || busy}
            firstName={firstName}
            lastName={lastName}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            tagInput={tagInput}
            onTagInputChange={setTagInput}
          />
          <SheetFooter className="px-0">
            <Button type="submit" disabled={fieldsDisabled || busy}>
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
