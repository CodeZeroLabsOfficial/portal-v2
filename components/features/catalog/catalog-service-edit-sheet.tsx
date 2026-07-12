"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import {
  CatalogServiceFormFields,
  catalogServiceFormInvalidIsPricing,
  catalogServiceFormInvalidMessage,
  useCatalogServicePricingFlags,
} from "@/components/features/catalog/catalog-service-form-fields";
import {
  CatalogServiceFeaturesEditor,
  CATALOG_MAX_FEATURE_LENGTH,
  CATALOG_MAX_FEATURES,
  normalizeCatalogFeatures,
} from "@/components/features/catalog/catalog-service-features-editor";
import { CatalogServiceStripePanel } from "@/components/features/catalog/catalog-service-stripe-panel";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormServerError } from "@/components/shared/form-server-error";
import {
  sheetActionsRowClass,
  sheetContentMediumClass,
  sheetFormClass,
  sheetTabsClass,
} from "@/components/shared/sheet-layout";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  deleteCatalogServiceAction,
  updateCatalogServiceAction,
  updateCatalogServiceFeaturesAction,
} from "@/server/actions/catalog-services";
import type { CatalogServiceRecord } from "@/types/catalog-service";

export interface CatalogServiceEditSheetProps {
  service: CatalogServiceRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function validateFeaturesDraft(features: string[]): string | null {
  const trimmed = normalizeCatalogFeatures(features);
  if (trimmed.length > CATALOG_MAX_FEATURES) {
    return `At most ${CATALOG_MAX_FEATURES} features allowed.`;
  }
  for (const feature of trimmed) {
    if (feature.length > CATALOG_MAX_FEATURE_LENGTH) {
      return `Each feature must be ${CATALOG_MAX_FEATURE_LENGTH} characters or fewer.`;
    }
  }
  return null;
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
  const [flatPrice, setFlatPrice] = React.useState("");
  const [upfront12, setUpfront12] = React.useState("");
  const [upfront24, setUpfront24] = React.useState("");
  const [monthly12, setMonthly12] = React.useState("");
  const [monthly24, setMonthly24] = React.useState("");
  const [featuresDraft, setFeaturesDraft] = React.useState<string[]>(() => [...service.features]);

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

  const resolvedLookupBase = normalizeLookupKeyBase(service.slug);

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
    setFlatPrice(prices.flatPrice);
    setUpfront12(prices.upfront12);
    setUpfront24(prices.upfront24);
    setMonthly12(prices.monthly12);
    setMonthly24(prices.monthly24);
    setFeaturesDraft([...service.features]);
    setServerError(null);
  }, [open, service, form]);

  function syncFormFromControls() {
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
    setActiveTab(catalogServiceFormInvalidIsPricing(errors) ? "pricing" : "overview");
  }

  async function onSubmit(values: CreateCatalogServiceInput) {
    setServerError(null);

    if (isPlan) {
      const featuresError = validateFeaturesDraft(featuresDraft);
      if (featuresError) {
        setServerError(featuresError);
        setActiveTab("features");
        return;
      }
    }

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

    if (isPlan) {
      const featuresResult = await updateCatalogServiceFeaturesAction({
        serviceId: service.id,
        features: normalizeCatalogFeatures(featuresDraft),
      });
      if (!featuresResult.ok) {
        setServerError(featuresResult.message);
        setActiveTab("features");
        return;
      }
    }

    toast.success("Service saved.");
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

  const formFieldProps = {
    form,
    mode: "edit" as const,
    serviceType,
    busy: busy || fieldsDisabled,
    flatPrice,
    setFlatPrice,
    upfront12,
    setUpfront12,
    upfront24,
    setUpfront24,
    monthly12,
    setMonthly12,
    monthly24,
    setMonthly24,
    idPrefix: "edit-catalog",
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className={sheetContentMediumClass}>
          <SheetHeader>
            <SheetTitle>Edit service</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleFormSubmit} className={sheetFormClass} noValidate>
            <FormServerError message={serverError} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className={sheetTabsClass}>
              <TabsList
                variant="line"
                className="h-auto w-full justify-start gap-6 rounded-none bg-transparent p-0"
              >
                <TabsTrigger value="overview" className="flex-none px-0 pb-3">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="pricing" className="flex-none px-0 pb-3">
                  Pricing
                </TabsTrigger>
                {isPlan ? (
                  <TabsTrigger value="features" className="flex-none px-0 pb-3">
                    Features
                  </TabsTrigger>
                ) : null}
                <TabsTrigger value="integrations" className="flex-none px-0 pb-3">
                  Integrations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <CatalogServiceFormFields {...formFieldProps} section="overview" />
              </TabsContent>

              <TabsContent value="pricing" className="mt-0">
                <CatalogServiceFormFields {...formFieldProps} section="pricing" />
              </TabsContent>

              {isPlan ? (
                <TabsContent value="features" className="mt-0">
                  <CatalogServiceFeaturesEditor
                    features={featuresDraft}
                    onChange={setFeaturesDraft}
                    disabled={busy || fieldsDisabled}
                  />
                </TabsContent>
              ) : null}

              <TabsContent value="integrations" className="mt-0">
                <CatalogServiceStripePanel service={service} disabled={fieldsDisabled} />
              </TabsContent>
            </Tabs>

            <div className={sheetActionsRowClass}>
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                onClick={() => setConfirmDeleteOpen(true)}
              >
                Delete
              </Button>
              <div className="flex items-center gap-2">
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
              </div>
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
