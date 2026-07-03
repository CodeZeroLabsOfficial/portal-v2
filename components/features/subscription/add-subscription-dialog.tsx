"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";

import { FormServerError } from "@/components/shared/form-server-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { isCatalogServicePlanPickerOption } from "@/lib/catalog/service-tier";
import { formatCurrencyAmount } from "@/lib/common/format";
import { StripeIntegrationNotConfiguredAlert } from "@/components/shared/stripe-not-configured-alert";
import { createSubscriptionSchema, type CreateSubscriptionInput } from "@/lib/schemas/subscription";
import { createSubscriptionAction } from "@/server/actions/subscriptions-crm";
import type { CatalogServicePickerOption } from "@/types/catalog-service";

interface StripeCardElement {
  mount: (selector: string | Element) => void;
  destroy: () => void;
}
interface StripeElementsInstance {
  create: (type: "card", options?: Record<string, unknown>) => StripeCardElement;
}
interface StripeSetupIntentResult {
  setupIntent?: { payment_method?: string | null };
  error?: { message?: string };
}
interface StripeInstance {
  elements: () => StripeElementsInstance;
  confirmCardSetup: (
    clientSecret: string,
    data: { payment_method: { card: StripeCardElement; billing_details?: { name?: string } } }
  ) => Promise<StripeSetupIntentResult>;
}
declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeInstance;
  }
}

export interface AddSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerOptions: { id: string; label: string }[];
  catalogServiceOptions: CatalogServicePickerOption[];
  stripePublishableKey?: string;
}

interface SavedCardOption {
  id: string;
  summary: string;
}

function todayIsoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const defaultValues: CreateSubscriptionInput = {
  customerId: "",
  serviceId: "",
  startDate: todayIsoDate(),
  durationMonths: 12,
  collectionMethod: "charge_automatically",
  daysUntilDue: undefined,
  defaultPaymentMethodId: undefined
};

export function AddSubscriptionDialog({
  open,
  onOpenChange,
  customerOptions,
  catalogServiceOptions,
  stripePublishableKey,
}: AddSubscriptionDialogProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [cardError, setCardError] = React.useState<string | null>(null);
  const [cardReady, setCardReady] = React.useState(false);
  const [cardSaving, setCardSaving] = React.useState(false);
  const [cardLoading, setCardLoading] = React.useState(false);
  const [cardholderName, setCardholderName] = React.useState("");
  const [savedCards, setSavedCards] = React.useState<SavedCardOption[]>([]);
  const [showAddCard, setShowAddCard] = React.useState(false);
  const stripeRef = React.useRef<StripeInstance | null>(null);
  const cardRef = React.useRef<StripeCardElement | null>(null);

  const form = useForm<CreateSubscriptionInput>({
    resolver: zodResolver(createSubscriptionSchema) as Resolver<CreateSubscriptionInput>,
    defaultValues
  });

  const planServiceOptions = React.useMemo(
    () => catalogServiceOptions.filter(isCatalogServicePlanPickerOption),
    [catalogServiceOptions]
  );

  const orderedServices = React.useMemo(() => {
    const rank = (name: string): number => {
      const n = name.trim().toLowerCase();
      if (n === "starter") return 0;
      if (n === "professional") return 1;
      if (n === "premium") return 2;
      if (n === "enterprise") return 3;
      return 100;
    };
    return [...planServiceOptions].sort((a, b) => {
      const ra = rank(a.serviceName);
      const rb = rank(b.serviceName);
      if (ra !== rb) return ra - rb;
      return a.serviceName.localeCompare(b.serviceName, undefined, { sensitivity: "base" });
    });
  }, [planServiceOptions]);

  const collectionMethod = form.watch("collectionMethod");
  const selectedServiceId = form.watch("serviceId");
  const selectedService = React.useMemo(
    () => planServiceOptions.find((s) => s.serviceId === selectedServiceId),
    [planServiceOptions, selectedServiceId]
  );
  const durationOptions = selectedService?.durations ?? [];
  const selectedCustomerId = form.watch("customerId");
  const effectivePmId = form.watch("defaultPaymentMethodId");
  const publishableKey = stripePublishableKey?.trim();

  React.useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      setServerError(null);
      setCardError(null);
      setCardReady(false);
      setCardLoading(false);
      setCardholderName("");
      setSavedCards([]);
      setShowAddCard(false);
      if (cardRef.current) {
        cardRef.current.destroy();
        cardRef.current = null;
      }
    }
  }, [open, form]);

  React.useEffect(() => {
    if (!open) return;
    const firstService =
      orderedServices.find((s) => s.serviceName.trim().toLowerCase() === "starter") ??
      orderedServices[0];
    if (firstService && !selectedServiceId) {
      form.setValue("serviceId", firstService.serviceId, { shouldValidate: true });
      if (firstService.durations[0]) {
        form.setValue("durationMonths", firstService.durations[0].months, { shouldValidate: true });
      }
    }
  }, [open, orderedServices, selectedServiceId, form]);

  React.useEffect(() => {
    if (!selectedService) return;
    const current = form.getValues("durationMonths");
    const valid = selectedService.durations.some((d) => d.months === current);
    if (!valid && selectedService.durations[0]) {
      form.setValue("durationMonths", selectedService.durations[0].months, { shouldValidate: true });
    }
  }, [selectedService, form]);

  React.useEffect(() => {
    if (!open || collectionMethod !== "charge_automatically") return;
    const customerId = selectedCustomerId.trim();
    if (!customerId) {
      form.setValue("defaultPaymentMethodId", undefined, { shouldDirty: false });
      setSavedCards([]);
      setShowAddCard(false);
      return;
    }
    let cancelled = false;
    async function loadExistingPaymentMethod() {
      setCardLoading(true);
      setCardError(null);
      try {
        const res = await fetch(
          `/api/stripe/setup-intent?customerId=${encodeURIComponent(customerId)}`,
          { method: "GET" }
        );
        const data = (await res.json()) as {
          defaultPaymentMethodId?: string | null;
          defaultPaymentMethodSummary?: string | null;
          cards?: SavedCardOption[];
          error?: string;
        };
        if (!res.ok) {
          if (!cancelled) setCardError(data.error ?? "Could not load existing card.");
          return;
        }
        if (cancelled) return;
        const pmId = data.defaultPaymentMethodId?.trim() || undefined;
        form.setValue("defaultPaymentMethodId", pmId, { shouldDirty: false, shouldValidate: true });
        setSavedCards(Array.isArray(data.cards) ? data.cards : []);
        setShowAddCard(!pmId);
      } catch (error) {
        if (!cancelled) {
          setCardError(error instanceof Error ? error.message : "Could not load existing card.");
        }
      } finally {
        if (!cancelled) setCardLoading(false);
      }
    }
    void loadExistingPaymentMethod();
    return () => {
      cancelled = true;
    };
  }, [open, collectionMethod, selectedCustomerId, form]);

  React.useEffect(() => {
    if (collectionMethod !== "charge_automatically" || !open || !showAddCard) return;
    if (!publishableKey) return;
    const key = publishableKey;
    let cancelled = false;
    async function mountCardElement() {
      if (cardRef.current) return;
      const mountTarget = document.getElementById("subscription-card-element");
      if (!mountTarget) return;
      if (!window.Stripe) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
          if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error("Stripe.js failed to load.")), {
              once: true
            });
            return;
          }
          const script = document.createElement("script");
          script.src = "https://js.stripe.com/v3/";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Stripe.js failed to load."));
          document.head.appendChild(script);
        });
      }
      if (cancelled) return;
      if (!window.Stripe) {
        setCardError("Stripe.js is unavailable.");
        return;
      }
      stripeRef.current = window.Stripe(key);
      const elements = stripeRef.current.elements();
      const card = elements.create("card", { hidePostalCode: true });
      card.mount(mountTarget);
      cardRef.current = card;
      setCardReady(true);
    }
    void mountCardElement().catch((e) => {
      const message = e instanceof Error ? e.message : "Could not initialise card entry.";
      if (message.includes("#subscription-card-element")) return;
      setCardError(message);
    });
    return () => {
      cancelled = true;
    };
  }, [collectionMethod, open, publishableKey, showAddCard]);

  React.useEffect(() => {
    if (showAddCard) return;
    if (cardRef.current) {
      cardRef.current.destroy();
      cardRef.current = null;
    }
    setCardReady(false);
  }, [showAddCard]);

  async function saveCardPaymentMethod() {
    setCardError(null);
    if (!selectedCustomerId.trim()) {
      setCardError("Select a customer first.");
      return;
    }
    if (!stripeRef.current || !cardRef.current) {
      setCardError("Card input is not ready yet.");
      return;
    }
    setCardSaving(true);
    try {
      const res = await fetch("/api/stripe/setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: selectedCustomerId })
      });
      const data = (await res.json()) as { clientSecret?: string; error?: string };
      if (!res.ok || !data.clientSecret) {
        setCardError(data.error ?? "Could not start card setup.");
        return;
      }
      const result = await stripeRef.current.confirmCardSetup(data.clientSecret, {
        payment_method: {
          card: cardRef.current,
          billing_details: { name: cardholderName.trim() || undefined }
        }
      });
      if (result.error?.message) {
        setCardError(result.error.message);
        return;
      }
      const pmId = result.setupIntent?.payment_method;
      if (!pmId) {
        setCardError("Card setup completed but no payment method id was returned.");
        return;
      }
      form.setValue("defaultPaymentMethodId", pmId, { shouldValidate: true, shouldDirty: true });
      const customerId = selectedCustomerId.trim();
      if (customerId) {
        const refreshRes = await fetch(
          `/api/stripe/setup-intent?customerId=${encodeURIComponent(customerId)}`,
          { method: "GET" }
        );
        const refreshData = (await refreshRes.json()) as { cards?: SavedCardOption[] };
        if (refreshRes.ok && Array.isArray(refreshData.cards)) {
          setSavedCards(refreshData.cards);
        }
      }
      setShowAddCard(false);
    } catch (error) {
      setCardError(error instanceof Error ? error.message : "Could not save card details.");
    } finally {
      setCardSaving(false);
    }
  }

  async function onSubmit(values: CreateSubscriptionInput) {
    setServerError(null);
    const duration = durationOptions.find((d) => d.months === values.durationMonths);
    if (!duration) {
      setServerError("Select a valid duration for the selected service.");
      return;
    }
    const payload: CreateSubscriptionInput = {
      ...values,
      daysUntilDue:
        values.collectionMethod === "send_invoice" ? (values.daysUntilDue ?? 14) : undefined,
      defaultPaymentMethodId:
        values.collectionMethod === "charge_automatically"
          ? values.defaultPaymentMethodId?.trim() || undefined
          : undefined
    };
    const result = await createSubscriptionAction(payload);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    onOpenChange(false);
    router.refresh();
  }

  const busy = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>New subscription</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col gap-4" noValidate>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <FormServerError message={serverError} />

            <div className="space-y-1.5">
              <Label htmlFor="subscription-customer">
                Customer <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.watch("customerId") || undefined}
                onValueChange={(value) => form.setValue("customerId", value, { shouldValidate: true })}
                disabled={busy}>
                <SelectTrigger id="subscription-customer">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customerOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.customerId ? (
                <p className="text-destructive text-xs">{form.formState.errors.customerId.message}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="subscription-service">Service</Label>
                <Select
                  value={selectedServiceId || undefined}
                  onValueChange={(value) => form.setValue("serviceId", value, { shouldValidate: true })}
                  disabled={busy || orderedServices.length === 0}>
                  <SelectTrigger id="subscription-service">
                    <SelectValue
                      placeholder={
                        orderedServices.length === 0
                          ? "No active plan services"
                          : "Select service"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {orderedServices.map((opt) => (
                      <SelectItem key={opt.serviceId} value={opt.serviceId}>
                        {opt.serviceName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subscription-duration">Duration</Label>
                <Select
                  value={String(form.watch("durationMonths"))}
                  onValueChange={(value) =>
                    form.setValue("durationMonths", Number(value), { shouldValidate: true })
                  }
                  disabled={busy || durationOptions.length === 0}>
                  <SelectTrigger id="subscription-duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((d) => (
                      <SelectItem key={`${selectedServiceId}-${d.months}`} value={String(d.months)}>
                        {d.months} months · {formatCurrencyAmount(d.unitAmountMinor, d.currency)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subscription-start-date">Start date</Label>
              <Input id="subscription-start-date" type="date" disabled={busy} {...form.register("startDate")} />
              {form.formState.errors.startDate ? (
                <p className="text-destructive text-xs">{form.formState.errors.startDate.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subscription-collection-method">Collection method</Label>
              <Select
                value={collectionMethod}
                onValueChange={(value) =>
                  form.setValue(
                    "collectionMethod",
                    value as CreateSubscriptionInput["collectionMethod"],
                    { shouldValidate: true }
                  )
                }
                disabled={busy}>
                <SelectTrigger id="subscription-collection-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="charge_automatically">Automatic charge</SelectItem>
                  <SelectItem value="send_invoice">Send invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {collectionMethod === "send_invoice" ? (
              <div className="space-y-1.5">
                <Label htmlFor="subscription-days-until-due">Days until due</Label>
                <Input
                  id="subscription-days-until-due"
                  type="number"
                  min={1}
                  max={90}
                  disabled={busy}
                  value={form.watch("daysUntilDue") ?? 14}
                  onChange={(e) =>
                    form.setValue("daysUntilDue", Number(e.target.value), { shouldValidate: true })
                  }
                />
                {form.formState.errors.daysUntilDue ? (
                  <p className="text-destructive text-xs">{form.formState.errors.daysUntilDue.message}</p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border p-3">
                <Label>Credit card details</Label>
                <Select
                  value={showAddCard ? "__add_new__" : effectivePmId ?? ""}
                  onValueChange={(value) => {
                    if (value === "__add_new__") {
                      setShowAddCard(true);
                      form.setValue("defaultPaymentMethodId", undefined, { shouldValidate: true });
                      return;
                    }
                    setShowAddCard(false);
                    form.setValue("defaultPaymentMethodId", value || undefined, { shouldValidate: true });
                  }}
                  disabled={busy || cardLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select card" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedCards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.summary}
                      </SelectItem>
                    ))}
                    <SelectItem value="__add_new__">+ Add another card</SelectItem>
                  </SelectContent>
                </Select>
                {showAddCard ? (
                  <>
                    <Input
                      id="cardholderName"
                      placeholder="Cardholder name"
                      autoComplete="cc-name"
                      disabled={busy || cardSaving}
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                    />
                    <div
                      id="subscription-card-element"
                      className="rounded-md border bg-background px-3 py-2.5 text-sm"
                    />
                  </>
                ) : null}
                {!publishableKey ? <StripeIntegrationNotConfiguredAlert /> : null}
                {cardError ? <p className="text-destructive text-xs">{cardError}</p> : null}
                {cardLoading ? (
                  <p className="text-muted-foreground text-xs">Checking existing card…</p>
                ) : null}
                {showAddCard ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy || cardSaving || !cardReady || !publishableKey}
                    onClick={() => void saveCardPaymentMethod()}>
                    {cardSaving ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
                    Save card
                  </Button>
                ) : null}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
