"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormServerError } from "@/components/shared/form-server-error";
import {
  sheetContentMediumClass,
  sheetFormClass,
} from "@/components/shared/sheet-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  updateCompanySettingsSchema,
  type UpdateCompanySettingsInput,
} from "@/lib/schemas/company-settings";
import { updateWorkspaceCompanySettingsAction } from "@/server/actions/company-settings";
import type { WorkspaceCompanySettings } from "@/types/organization";

function settingsToFormDefaults(s: WorkspaceCompanySettings): UpdateCompanySettingsInput {
  return {
    name: s.name,
    phone: s.phone,
    email: s.email,
    website: s.website,
    acn: s.acn,
    abn: s.abn,
    addressLine1: s.addressLine1,
    addressLine2: s.addressLine2,
    city: s.city,
    region: s.region,
    postalCode: s.postalCode,
    country: s.country,
  };
}

function mergeSettingsFromInput(
  current: WorkspaceCompanySettings,
  v: UpdateCompanySettingsInput,
): WorkspaceCompanySettings {
  return {
    ...current,
    name: v.name.trim(),
    phone: v.phone.trim(),
    email: v.email.trim(),
    website: v.website.trim(),
    acn: v.acn.trim(),
    abn: v.abn.trim(),
    addressLine1: v.addressLine1.trim(),
    addressLine2: v.addressLine2.trim(),
    city: v.city.trim(),
    region: v.region.trim(),
    postalCode: v.postalCode.trim(),
    country: v.country.trim(),
    updatedAt: Date.now(),
  };
}

export interface CompanyEditSheetProps {
  settings: WorkspaceCompanySettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (settings: WorkspaceCompanySettings) => void;
}

export function CompanyEditSheet({ settings, open, onOpenChange, onSaved }: CompanyEditSheetProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<UpdateCompanySettingsInput>({
    resolver: zodResolver(updateCompanySettingsSchema),
    defaultValues: settingsToFormDefaults(settings),
  });

  React.useEffect(() => {
    if (open) {
      form.reset(settingsToFormDefaults(settings));
      setServerError(null);
    }
  }, [open, settings, form]);

  async function onSubmit(values: UpdateCompanySettingsInput) {
    setServerError(null);
    const result = await updateWorkspaceCompanySettingsAction(values);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    toast.success("Company settings saved");
    onSaved(mergeSettingsFromInput(settings, values));
    onOpenChange(false);
    router.refresh();
  }

  const busy = form.formState.isSubmitting;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={sheetContentMediumClass}>
        <SheetHeader>
          <SheetTitle>Edit company</SheetTitle>
          <SheetDescription>
            Update how your organization appears on invoices and proposals.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className={sheetFormClass} noValidate>
          <FormServerError message={serverError} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="company-name">Company name</Label>
              <Input
                id="company-name"
                autoComplete="organization"
                placeholder="Company Name Pty Ltd"
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Phone</Label>
              <Input
                id="company-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+61 400 000 000"
                {...form.register("phone")}
              />
              {form.formState.errors.phone ? (
                <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                autoComplete="email"
                placeholder="info@company.com"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-abn">ABN</Label>
              <Input id="company-abn" autoComplete="off" placeholder="12 345 678 901" {...form.register("abn")} />
              {form.formState.errors.abn ? (
                <p className="text-xs text-destructive">{form.formState.errors.abn.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-acn">ACN</Label>
              <Input id="company-acn" autoComplete="off" placeholder="123 456 789" {...form.register("acn")} />
              {form.formState.errors.acn ? (
                <p className="text-xs text-destructive">{form.formState.errors.acn.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Address</Label>
              <Input placeholder="Line 1" autoComplete="address-line1" {...form.register("addressLine1")} />
              <Input placeholder="Line 2" autoComplete="address-line2" {...form.register("addressLine2")} />
              <div className="grid gap-2 sm:grid-cols-2">
                <Input placeholder="City" autoComplete="address-level2" {...form.register("city")} />
                <Input placeholder="State / region" autoComplete="address-level1" {...form.register("region")} />
                <Input placeholder="Postal code" autoComplete="postal-code" {...form.register("postalCode")} />
                <Input placeholder="Country" autoComplete="country-name" {...form.register("country")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-website">Website</Label>
              <Input
                id="company-website"
                autoComplete="url"
                placeholder="https://www.company.com"
                {...form.register("website")}
              />
              {form.formState.errors.website ? (
                <p className="text-xs text-destructive">{form.formState.errors.website.message}</p>
              ) : null}
            </div>
          </div>

          <Button type="submit" disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
