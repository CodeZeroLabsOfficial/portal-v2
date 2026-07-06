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
import { CatalogServiceStripePanel } from "@/components/features/catalog/catalog-service-stripe-panel";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormServerError } from "@/components/shared/form-server-error";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildCatalogServicePayload,
  majorInputToMinor,
  servicePriceControlDefaults,
  serviceToEditDefaults,
} from "@/lib/catalog/form-defaults";
import { normalizeLookupKeyBase, previewCatalogServiceLookupKeys } from "@/lib/catalog/service-slug";
import {
  createCatalogServiceSchema,
  type CreateCatalogServiceInput,
} from "@/lib/schemas/catalog-service";
import {
  deleteCatalogServiceAction,
  updateCatalogServiceAction,
} from "@/server/actions/catalog-services";
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
  const [activeTab, setActiveTab] = React.useState("overview");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
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
  const { isPlan, isFlat, isByTerm, showUpfront } = useCatalogServicePricingFlags(
    serviceType,
    billingType,
    pricingModel,
  );

  const resolvedLookupBase = normalizeLookupKeyBase(lookupKeyBase);
  const isOneOff = billingType === "one_off";

  const lookupPreviewKeys = React.useMemo(() => {
    return previewCatalogServiceLookupKeys({
      lookupKeyBase: resolvedLookupBase,
      serviceType,
      billingType,
      pricingModel: isOneOff ? "flat" : pricingModel,
    });
  }, [resolvedLookupBase, serviceType, billingType, pricingModel, isOneOff]);

  React.useEffect(() => {
    if (!open) {
      setActiveTab("overview");
      setConfirmDeleteOpen(false);
      return;
    }
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
    setActiveTab("overview");
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
      setActiveTab("overview");
      return;
    }

    toast.success("Service saved. Open Integrations to re-sync Stripe if prices changed.");
    onOpenChange(false);
    router.refresh();
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    syncFormFromControls();
    void form.handleSubmit(onSubmit, onInvalid)(event);
  }

  async function handleDelete() {
    const result = await deleteCatalogServiceAction(service.id);
    if (!result.ok) {
      toast.error(result.message);
      throw new Error(result.message);
    }
    toast.success("Service deleted.");
    onOpenChange(false);
    router.push("/admin/services");
  }

  const busy = form.formState.isSubmitting;
  const serviceName = service.name.trim();

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Edit service</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4 px-4" noValidate>
            <FormServerError message={serverError} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
              <TabsList
                variant="line"
                className="h-auto w-full justify-start gap-6 rounded-none bg-transparent p-0"
              >
                <TabsTrigger value="overview" className="flex-none px-0 pb-3">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex-none px-0 pb-3">
                  Integrations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
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
                  hideStripeLookupPreview
                  idPrefix="edit-catalog"
                />
              </TabsContent>

              <TabsContent value="integrations" className="mt-0">
                <CatalogServiceStripePanel
                  service={service}
                  lookupPreviewKeys={lookupPreviewKeys}
                  disabled={fieldsDisabled}
                />
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                onClick={() => setConfirmDeleteOpen(true)}
              >
                Delete service
              </Button>
              <Button type="submit" disabled={busy || fieldsDisabled} className="min-w-[7rem] gap-2">
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Save
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete service"
        description={
          serviceName
            ? `Delete "${serviceName}" permanently? It will be removed from the catalogue. Linked Stripe product will be deactivated if present; existing subscriptions are not changed.`
            : "Delete this service permanently? It will be removed from the catalogue. Linked Stripe product will be deactivated if present; existing subscriptions are not changed."
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}
