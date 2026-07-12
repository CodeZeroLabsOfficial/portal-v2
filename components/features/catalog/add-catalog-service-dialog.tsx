"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";

import {
  CatalogServiceFormFields,
  catalogServiceFormInvalidMessage,
  useCatalogServicePricingFlags,
} from "@/components/features/catalog/catalog-service-form-fields";
import { FormServerError } from "@/components/shared/form-server-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildCatalogServicePayload, majorInputToMinor } from "@/lib/catalog/form-defaults";
import { DEFAULT_CATALOG_CATEGORY_ID } from "@/lib/catalog/categories";
import { normalizeLookupKeyBase, slugifyCatalogServiceName } from "@/lib/catalog/service-slug";
import {
  createCatalogServiceSchema,
  type CreateCatalogServiceInput,
} from "@/lib/schemas/catalog-service";
import { createCatalogServiceAction } from "@/server/actions/catalog-services";

interface AddCatalogServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultValues: CreateCatalogServiceInput = {
  serviceType: "plan",
  category: DEFAULT_CATALOG_CATEGORY_ID,
  name: "",
  description: "",
  billingType: "recurring",
  pricingModel: "by_term",
  lookupKeyBase: "",
  currency: "aud",
  flatAmountMinor: 0,
  monthlyCost12Minor: 0,
  monthlyCost24Minor: 0,
  includedUsers: 0,
  includedLocations: 0,
  includedAdmins: 0,
};

export function AddCatalogServiceDialog({ open, onOpenChange }: AddCatalogServiceDialogProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [flatPrice, setFlatPrice] = React.useState("");
  const [upfront12, setUpfront12] = React.useState("");
  const [upfront24, setUpfront24] = React.useState("");
  const [monthly12, setMonthly12] = React.useState("");
  const [monthly24, setMonthly24] = React.useState("");

  const form = useForm<CreateCatalogServiceInput>({
    resolver: zodResolver(createCatalogServiceSchema) as Resolver<CreateCatalogServiceInput>,
    defaultValues,
  });

  const serviceType = form.watch("serviceType");
  const billingType = form.watch("billingType");
  const pricingModel = form.watch("pricingModel");
  const { isPlan, isFlat, isByTerm, showUpfront } = useCatalogServicePricingFlags(
    serviceType,
    billingType,
    pricingModel,
  );

  React.useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      setFlatPrice("");
      setUpfront12("");
      setUpfront24("");
      setMonthly12("");
      setMonthly24("");
      setServerError(null);
    }
  }, [open, form]);

  function syncFormFromControls() {
    const name = form.getValues("name");
    const resolvedLookupBase = normalizeLookupKeyBase(slugifyCatalogServiceName(name));
    form.setValue("lookupKeyBase", resolvedLookupBase, { shouldValidate: false });
    if (isFlat) {
      form.setValue("flatAmountMinor", majorInputToMinor(flatPrice), { shouldValidate: false });
      form.setValue("upfrontCost12Minor", undefined, { shouldValidate: false });
      form.setValue("upfrontCost24Minor", undefined, { shouldValidate: false });
    } else {
      form.setValue("monthlyCost12Minor", majorInputToMinor(monthly12), { shouldValidate: false });
      form.setValue("monthlyCost24Minor", majorInputToMinor(monthly24), { shouldValidate: false });
      const upfront12Minor = majorInputToMinor(upfront12);
      const upfront24Minor = majorInputToMinor(upfront24);
      form.setValue(
        "upfrontCost12Minor",
        showUpfront && upfront12Minor > 0 ? upfront12Minor : undefined,
        { shouldValidate: false },
      );
      form.setValue(
        "upfrontCost24Minor",
        showUpfront && upfront24Minor > 0 ? upfront24Minor : undefined,
        { shouldValidate: false },
      );
    }
  }

  function onInvalid(errors: FieldErrors<CreateCatalogServiceInput>) {
    setServerError(catalogServiceFormInvalidMessage(errors));
  }

  async function onSubmit(values: CreateCatalogServiceInput) {
    setServerError(null);
    const resolvedLookupBase = normalizeLookupKeyBase(slugifyCatalogServiceName(values.name));
    const payload = buildCatalogServicePayload({
      values,
      resolvedLookupBase,
      isPlan,
      isFlat,
      isByTerm,
      showUpfront,
      flatPrice,
      upfront12,
      upfront24,
      monthly12,
      monthly24,
    }) as CreateCatalogServiceInput;

    const result = await createCatalogServiceAction(payload);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    onOpenChange(false);
    router.push(`/admin/services/${result.serviceId}`);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,860px)] max-w-[880px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[880px]">
        <DialogHeader className="shrink-0 border-b px-6 pb-5 pt-6 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight">Add a new service</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-6">
            <FormServerError message={serverError} />
            <CatalogServiceFormFields
              form={form}
              mode="create"
              serviceType={serviceType}
              busy={busy}
              flatPrice={flatPrice}
              setFlatPrice={setFlatPrice}
              upfront12={upfront12}
              setUpfront12={setUpfront12}
              upfront24={upfront24}
              setUpfront24={setUpfront24}
              monthly12={monthly12}
              setMonthly12={setMonthly12}
              monthly24={monthly24}
              setMonthly24={setMonthly24}
            />
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t px-6 pb-6 pt-4 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy} className="min-w-[7rem] gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
