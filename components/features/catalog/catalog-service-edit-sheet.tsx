"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import {
  CatalogServiceFormFields,
  catalogServiceFormInvalidMessage,
  useCatalogServicePricingFlags,
} from "@/components/features/catalog/catalog-service-form-fields";
import { FormServerError } from "@/components/shared/form-server-error";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  buildCatalogServicePayload,
  majorInputToMinor,
  servicePriceControlDefaults,
  serviceToEditDefaults,
} from "@/lib/catalog/form-defaults";
import { normalizeLookupKeyBase } from "@/lib/catalog/service-slug";
import {
  createCatalogServiceSchema,
  type CreateCatalogServiceInput,
} from "@/lib/schemas/catalog-service";
import { updateCatalogServiceAction } from "@/server/actions/catalog-services";
import type { CatalogServiceRecord } from "@/types/catalog-service";

export interface CatalogServiceEditSheetProps {
  service: CatalogServiceRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CatalogServiceEditSheet({
  service,
  open,
  onOpenChange,
}: CatalogServiceEditSheetProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [lookupKeyBase, setLookupKeyBase] = React.useState(service.slug);
  const [lookupTouched, setLookupTouched] = React.useState(false);
  const [flatPrice, setFlatPrice] = React.useState("");
  const [upfrontPrice, setUpfrontPrice] = React.useState("");
  const [monthly12, setMonthly12] = React.useState("");
  const [monthly24, setMonthly24] = React.useState("");

  const serviceType = service.serviceType ?? "plan";
  const fieldsDisabled = service.status === "archived";

  const form = useForm<CreateCatalogServiceInput>({
    resolver: zodResolver(createCatalogServiceSchema) as Resolver<CreateCatalogServiceInput>,
    defaultValues: {
      ...serviceToEditDefaults(service),
      serviceType,
    },
  });

  const billingType = form.watch("billingType");
  const pricingModel = form.watch("pricingModel");
  const name = form.watch("name");
  const { isPlan, isFlat, isByTerm, showUpfront } = useCatalogServicePricingFlags(
    serviceType,
    billingType,
    pricingModel,
  );

  const resolvedLookupBase = normalizeLookupKeyBase(lookupKeyBase);

  React.useEffect(() => {
    if (!open) return;
    const defaults = serviceToEditDefaults(service);
    const prices = servicePriceControlDefaults(service);
    form.reset({
      ...defaults,
      serviceType: service.serviceType ?? "plan",
    });
    setLookupKeyBase(service.slug);
    setLookupTouched(true);
    setFlatPrice(prices.flatPrice);
    setUpfrontPrice(prices.upfrontPrice);
    setMonthly12(prices.monthly12);
    setMonthly24(prices.monthly24);
    setServerError(null);
  }, [open, service, form]);

  function syncFormFromControls() {
    form.setValue("lookupKeyBase", resolvedLookupBase, { shouldValidate: false });
    if (isFlat) {
      form.setValue("flatAmountMinor", majorInputToMinor(flatPrice), { shouldValidate: false });
      form.setValue("upfrontCost12Minor", undefined, { shouldValidate: false });
    } else {
      form.setValue("monthlyCost12Minor", majorInputToMinor(monthly12), { shouldValidate: false });
      form.setValue("monthlyCost24Minor", majorInputToMinor(monthly24), { shouldValidate: false });
      const upfrontMinor = majorInputToMinor(upfrontPrice);
      form.setValue(
        "upfrontCost12Minor",
        showUpfront && upfrontMinor > 0 ? upfrontMinor : undefined,
        { shouldValidate: false },
      );
    }
  }

  function onInvalid(errors: FieldErrors<CreateCatalogServiceInput>) {
    setServerError(catalogServiceFormInvalidMessage(errors));
  }

  async function onSubmit(values: CreateCatalogServiceInput) {
    setServerError(null);
    const payload = buildCatalogServicePayload({
      values,
      resolvedLookupBase,
      isPlan,
      isFlat,
      isByTerm,
      showUpfront,
      flatPrice,
      upfrontPrice,
      monthly12,
      monthly24,
    });

    const result = await updateCatalogServiceAction({
      ...payload,
      serviceId: service.id,
    });

    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    toast.success("Service saved. Re-sync from the services list to update Stripe.");
    onOpenChange(false);
    router.refresh();
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    syncFormFromControls();
    void form.handleSubmit(onSubmit, onInvalid)(event);
  }

  const busy = form.formState.isSubmitting;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Edit service</SheetTitle>
          <SheetDescription>{name.trim() || service.slug}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleFormSubmit} className="mt-6 space-y-4 px-4" noValidate>
          <FormServerError message={serverError} />
          <CatalogServiceFormFields
            form={form}
            mode="edit"
            serviceType={serviceType}
            busy={busy || fieldsDisabled}
            lookupKeyBase={lookupKeyBase}
            setLookupKeyBase={setLookupKeyBase}
            lookupTouched={lookupTouched}
            setLookupTouched={setLookupTouched}
            flatPrice={flatPrice}
            setFlatPrice={setFlatPrice}
            upfrontPrice={upfrontPrice}
            setUpfrontPrice={setUpfrontPrice}
            monthly12={monthly12}
            setMonthly12={setMonthly12}
            monthly24={monthly24}
            setMonthly24={setMonthly24}
            idPrefix="edit-catalog"
          />

          <SheetFooter className="gap-2 px-0 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy || fieldsDisabled} className="min-w-[7rem] gap-2">
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
