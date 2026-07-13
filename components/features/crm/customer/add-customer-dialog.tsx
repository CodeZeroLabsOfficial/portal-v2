"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, ChevronLeft, ChevronRight, Loader2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AccountFormFields } from "@/components/features/crm/account/account-form-fields";
import { FormServerError } from "@/components/shared/form-server-error";
import { FormStepHeader } from "@/components/shared/form-step-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatAddressLines, normalizeAddressFields } from "@/lib/common/format";
import { combineCustomerName } from "@/lib/customer/name-split";
import {
  createAccountFormSchema,
  type CreateAccountFormInput,
} from "@/lib/schemas/account";
import { optionalTrimmed } from "@/lib/schemas/customer";
import { createAccountAction, listAccountsForPickerAction } from "@/server/actions/accounts-crm";
import { createCustomerAction } from "@/server/actions/customers-crm";
import type { AccountRecord } from "@/types/account";

type AccountMode = "existing" | "new";

const trimmed = z.string().trim();

const contactStepSchema = z.object({
  name: trimmed.min(1, "Name is required").max(200),
  email: trimmed.email("Valid email required").max(320),
  phone: optionalTrimmed,
  addressLine1: optionalTrimmed,
  addressLine2: optionalTrimmed,
  city: optionalTrimmed,
  region: optionalTrimmed,
  postalCode: optionalTrimmed,
  country: optionalTrimmed,
  saveAsLead: z.boolean(),
});

type ContactStepValues = z.infer<typeof contactStepSchema>;

const EMPTY_ACCOUNT: CreateAccountFormInput = {
  company: "",
  companyPhone: "",
  companyEmail: "",
  companyWebsite: "",
  companyAbn: "",
  companyAcn: "",
  companyAddressLine1: "",
  companyAddressLine2: "",
  companyCity: "",
  companyRegion: "",
  companyPostalCode: "",
  companyCountry: "",
};

const EMPTY_CONTACT: ContactStepValues = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
  saveAsLead: false,
};

const STEPS = [
  {
    id: "account",
    title: "Account Details",
    description: "Setup account details",
    icon: Building2,
  },
  {
    id: "contact",
    title: "Contact Information",
    description: "Add personal info",
    icon: User,
  },
] as const;

const selectClassName =
  "border-input bg-background h-9 w-full rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50";

export interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, step 1 starts on “existing” with this account selected (e.g. from account detail). */
  initialAccountId?: string;
  /** When set, called instead of navigating to the new customer detail page. */
  onCreated?: (customerId: string) => void;
}

export function AddCustomerDialog({
  open,
  onOpenChange,
  initialAccountId,
  onCreated,
}: AddCustomerDialogProps) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [accounts, setAccounts] = React.useState<AccountRecord[]>([]);
  const [accountMode, setAccountMode] = React.useState<AccountMode>(
    initialAccountId ? "existing" : "new",
  );
  const [selectedAccountId, setSelectedAccountId] = React.useState(initialAccountId?.trim() ?? "");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  const accountForm = useForm<CreateAccountFormInput>({
    resolver: zodResolver(createAccountFormSchema),
    defaultValues: EMPTY_ACCOUNT,
  });

  const contactForm = useForm<ContactStepValues>({
    resolver: zodResolver(contactStepSchema) as Resolver<ContactStepValues>,
    defaultValues: EMPTY_CONTACT,
  });

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void listAccountsForPickerAction().then((res) => {
      if (cancelled || !res.ok) return;
      setAccounts(res.accounts);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) {
      setStep(0);
      setServerError(null);
      setSubmitting(false);
      setAccountMode(initialAccountId ? "existing" : "new");
      setSelectedAccountId(initialAccountId?.trim() ?? "");
      setFirstName("");
      setLastName("");
      accountForm.reset(EMPTY_ACCOUNT);
      contactForm.reset(EMPTY_CONTACT);
      return;
    }
    setAccountMode(initialAccountId ? "existing" : "new");
    setSelectedAccountId(initialAccountId?.trim() ?? "");
  }, [open, initialAccountId, accountForm, contactForm]);

  React.useEffect(() => {
    contactForm.setValue("name", combineCustomerName(firstName, lastName), {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [firstName, lastName, contactForm]);

  const selectedAccount = React.useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  );

  const selectedAccountAddress = React.useMemo(() => {
    if (!selectedAccount) return "";
    return formatAddressLines({
      addressLine1: selectedAccount.companyAddressLine1,
      addressLine2: selectedAccount.companyAddressLine2,
      city: selectedAccount.companyCity,
      region: selectedAccount.companyRegion,
      postalCode: selectedAccount.companyPostalCode,
      country: selectedAccount.companyCountry,
    }).join("\n");
  }, [selectedAccount]);

  function copyAccountAddressToContact() {
    const opts = { shouldDirty: true, shouldTouch: true };
    if (accountMode === "existing" && selectedAccount) {
      contactForm.setValue("addressLine1", selectedAccount.companyAddressLine1 ?? "", opts);
      contactForm.setValue("addressLine2", selectedAccount.companyAddressLine2 ?? "", opts);
      contactForm.setValue("city", selectedAccount.companyCity ?? "", opts);
      contactForm.setValue("region", selectedAccount.companyRegion ?? "", opts);
      contactForm.setValue("postalCode", selectedAccount.companyPostalCode ?? "", opts);
      contactForm.setValue("country", selectedAccount.companyCountry ?? "", opts);
      return;
    }
    if (accountMode === "new") {
      const v = accountForm.getValues();
      contactForm.setValue("addressLine1", v.companyAddressLine1 ?? "", opts);
      contactForm.setValue("addressLine2", v.companyAddressLine2 ?? "", opts);
      contactForm.setValue("city", v.companyCity ?? "", opts);
      contactForm.setValue("region", v.companyRegion ?? "", opts);
      contactForm.setValue("postalCode", v.companyPostalCode ?? "", opts);
      contactForm.setValue("country", v.companyCountry ?? "", opts);
    }
  }

  async function handleNext() {
    setServerError(null);
    if (accountMode === "existing") {
      if (!selectedAccountId.trim()) {
        setServerError("Select an account, or choose Create new.");
        return;
      }
      setStep(1);
      return;
    }
    const valid = await accountForm.trigger();
    if (!valid) return;
    setStep(1);
  }

  async function handleCreate(values: ContactStepValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      let accountId: string | undefined;

      if (accountMode === "existing") {
        accountId = selectedAccountId.trim() || undefined;
        if (!accountId) {
          setServerError("Select an account.");
          return;
        }
      } else if (accountMode === "new") {
        const accountValid = await accountForm.trigger();
        if (!accountValid) {
          setStep(0);
          return;
        }
        const accountValues = accountForm.getValues();
        const created = await createAccountAction(accountValues);
        if (!created.ok) {
          setServerError(created.message);
          setStep(0);
          return;
        }
        accountId = created.accountId;
      }

      const contactAddress = normalizeAddressFields({
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2,
        city: values.city,
        region: values.region,
        postalCode: values.postalCode,
        country: values.country,
      });

      const result = await createCustomerAction({
        ...values,
        ...contactAddress,
        accountId,
        tags: [],
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
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || accountForm.formState.isSubmitting || contactForm.formState.isSubmitting;
  const canCopyAddress = accountMode === "existing" ? Boolean(selectedAccount) : accountMode === "new";
  const lockExistingAccount = Boolean(initialAccountId?.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(90vh,44rem)] w-full max-w-5xl flex-col overflow-hidden sm:max-w-5xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Add customer</DialogTitle>
        </DialogHeader>

        <FormStepHeader steps={[...STEPS]} currentStep={step} className="shrink-0 pb-2" />

        <FormServerError message={serverError} />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {step === 0 ? (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              <div>
                <h3 className="text-lg font-semibold">Account Information</h3>
                <p className="text-muted-foreground text-sm">
                  Link an existing company or enter new account details.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-customer-account-mode">Account type</Label>
                <select
                  id="add-customer-account-mode"
                  className={selectClassName}
                  disabled={busy || lockExistingAccount}
                  value={accountMode}
                  onChange={(e) => {
                    setAccountMode(e.target.value as AccountMode);
                    setServerError(null);
                  }}>
                  <option value="existing">Existing account</option>
                  <option value="new">Create new</option>
                </select>
              </div>

              {/* Fixed footprint so mode switches don’t resize the dialog */}
              <div className="min-h-[22rem]">
                {accountMode === "existing" ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Select account</p>
                      <div className="space-y-2">
                        <Label htmlFor="add-customer-account">Account</Label>
                        <select
                          id="add-customer-account"
                          className={selectClassName}
                          disabled={busy || lockExistingAccount}
                          value={selectedAccountId}
                          onChange={(e) => setSelectedAccountId(e.target.value)}>
                          <option value="">Select an account…</option>
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.company}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Address</p>
                      {selectedAccountAddress ? (
                        <p className="text-muted-foreground whitespace-pre-line text-sm">
                          {selectedAccountAddress}
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Select an account to preview its address.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}

                {accountMode === "new" ? (
                  <AccountFormFields
                    form={accountForm}
                    idPrefix="add-customer-account"
                    disabled={busy}
                    layout="split"
                  />
                ) : null}
              </div>
            </div>
          ) : (
            <form
              id="add-customer-contact-form"
              onSubmit={contactForm.handleSubmit(handleCreate)}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"
              noValidate>
              <div>
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <p className="text-muted-foreground text-sm">
                  Who is the primary contact for this account?
                </p>
              </div>

              <input type="hidden" {...contactForm.register("name")} />

              <div className="grid min-h-[22rem] gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <p className="text-sm font-medium">Contact details</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="add-customer-first-name">First name</Label>
                      <div className="flex overflow-hidden rounded-md border">
                        <select
                          id="add-customer-record-type"
                          className="h-9 appearance-none border-r bg-transparent py-1 pl-3 pr-7 text-sm focus-visible:outline-none"
                          value={contactForm.watch("saveAsLead") ? "lead" : "contact"}
                          disabled={busy}
                          aria-label="Record type"
                          onChange={(e) =>
                            contactForm.setValue("saveAsLead", e.target.value === "lead", {
                              shouldDirty: true,
                            })
                          }>
                          <option value="contact">Contact</option>
                          <option value="lead">Lead</option>
                        </select>
                        <Input
                          id="add-customer-first-name"
                          autoComplete="given-name"
                          className="h-9 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0"
                          placeholder="John"
                          value={firstName}
                          disabled={busy}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-customer-last-name">Last name</Label>
                      <Input
                        id="add-customer-last-name"
                        autoComplete="family-name"
                        placeholder="Smith"
                        value={lastName}
                        disabled={busy}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-customer-email">Email *</Label>
                      <Input
                        id="add-customer-email"
                        type="email"
                        autoComplete="email"
                        disabled={busy}
                        {...contactForm.register("email")}
                      />
                      {contactForm.formState.errors.email ? (
                        <p className="text-destructive text-xs">
                          {contactForm.formState.errors.email.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-customer-phone">Phone</Label>
                      <Input
                        id="add-customer-phone"
                        type="tel"
                        autoComplete="tel"
                        disabled={busy}
                        {...contactForm.register("phone")}
                      />
                    </div>
                  </div>
                  {contactForm.formState.errors.name ? (
                    <p className="text-destructive text-xs">
                      {contactForm.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">Address</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={copyAccountAddressToContact}
                      disabled={busy || !canCopyAddress}>
                      Copy from account
                    </Button>
                  </div>
                  <Input
                    placeholder="Line 1"
                    autoComplete="address-line1"
                    disabled={busy}
                    {...contactForm.register("addressLine1")}
                  />
                  <Input
                    placeholder="Line 2"
                    autoComplete="address-line2"
                    disabled={busy}
                    {...contactForm.register("addressLine2")}
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="City"
                      autoComplete="address-level2"
                      disabled={busy}
                      {...contactForm.register("city")}
                    />
                    <Input
                      placeholder="State / region"
                      autoComplete="address-level1"
                      disabled={busy}
                      {...contactForm.register("region")}
                    />
                    <Input
                      placeholder="Postal code"
                      autoComplete="postal-code"
                      disabled={busy}
                      {...contactForm.register("postalCode")}
                    />
                    <Input
                      placeholder="Country"
                      autoComplete="country-name"
                      disabled={busy}
                      {...contactForm.register("country")}
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        <DialogFooter className="shrink-0 sm:justify-between">
          {step === 0 ? (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void handleNext()} disabled={busy}>
                Next
                <ChevronRight />
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => setStep(0)} disabled={busy}>
                <ChevronLeft />
                Previous
              </Button>
              <Button type="submit" form="add-customer-contact-form" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Create
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
