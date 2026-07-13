"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { CustomerProfileFormFields } from "@/components/features/crm/customer/customer-profile-form-fields";
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
  SheetTitle
} from "@/components/ui/sheet";
import { combineCustomerName } from "@/lib/customer/name-split";
import {
  EMPTY_CUSTOMER_PROFILE_FORM_VALUES,
  type CustomerProfileFormValues
} from "@/lib/customer/profile-form-values";
import { normalizeAddressFields } from "@/lib/common/format";
import { createCustomerSchema } from "@/lib/schemas/customer";
import { createCustomerAction } from "@/server/actions/customers-crm";

export interface AddCustomerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefill create form (e.g. company fields when adding a contact from an account). */
  initialValues?: Partial<CustomerProfileFormValues>;
  /** When set, called instead of navigating to the new customer detail page. */
  onCreated?: (customerId: string) => void;
}

export function AddCustomerSheet({
  open,
  onOpenChange,
  initialValues,
  onCreated
}: AddCustomerSheetProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  const resolvedDefaults = React.useMemo(
    (): CustomerProfileFormValues => ({
      ...EMPTY_CUSTOMER_PROFILE_FORM_VALUES,
      ...initialValues
    }),
    [initialValues]
  );

  const form = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: resolvedDefaults
  });

  React.useEffect(() => {
    if (!open) {
      form.reset(resolvedDefaults);
      setFirstName("");
      setLastName("");
      setServerError(null);
      return;
    }
    form.reset(resolvedDefaults);
  }, [open, form, resolvedDefaults]);

  React.useEffect(() => {
    form.setValue("name", combineCustomerName(firstName, lastName), {
      shouldValidate: true,
      shouldDirty: false
    });
  }, [firstName, lastName, form]);

  async function onSubmit(values: CustomerProfileFormValues) {
    setServerError(null);
    const contactAddress = normalizeAddressFields({
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      city: values.city,
      region: values.region,
      postalCode: values.postalCode,
      country: values.country
    });
    const { id: _id, ...createPayload } = values;
    const result = await createCustomerAction({
      ...createPayload,
      ...contactAddress,
      tags: []
    });
    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    toast.success("Customer created");
    onOpenChange(false);
    if (onCreated) {
      onCreated(result.customerId);
    } else {
      router.push(`/admin/customers/${result.customerId}`);
    }
    router.refresh();
  }

  const busy = form.formState.isSubmitting;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={sheetContentMediumClass}>
        <SheetHeader>
          <SheetTitle>Add customer</SheetTitle>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className={sheetFormClass} noValidate>
          <FormServerError message={serverError} />
          <CustomerProfileFormFields
            form={form}
            mode="create"
            disabled={busy}
            firstName={firstName}
            lastName={lastName}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            showAccountSection
            showTags={false}
          />
          <div className={sheetActionsEndClass}>
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
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
