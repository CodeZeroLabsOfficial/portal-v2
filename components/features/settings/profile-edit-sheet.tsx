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
import { updateUserProfileSchema, type UpdateUserProfileInput } from "@/lib/schemas/user-profile";
import { updateCurrentUserProfileAction } from "@/server/actions/user-profile";
import type { PortalUser } from "@/types/user";

function portalUserToFormDefaults(user: PortalUser): UpdateUserProfileInput {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    phone: user.phone ?? "",
    website: user.website ?? "",
    dateOfBirth: user.dateOfBirth ?? "",
    addressLine1: user.addressLine1 ?? "",
    addressLine2: user.addressLine2 ?? "",
    city: user.city ?? "",
    region: user.region ?? "",
    postalCode: user.postalCode ?? "",
    country: user.country ?? "",
  };
}

function mergeUserFromInput(current: PortalUser, v: UpdateUserProfileInput): PortalUser {
  const parts = [v.firstName.trim(), v.lastName.trim()].filter(Boolean);
  const displayName = parts.length > 0 ? parts.join(" ") : current.displayName;
  return {
    ...current,
    firstName: v.firstName.trim(),
    lastName: v.lastName.trim(),
    phone: v.phone.trim(),
    website: v.website.trim(),
    dateOfBirth: v.dateOfBirth.trim(),
    addressLine1: v.addressLine1.trim(),
    addressLine2: v.addressLine2.trim(),
    city: v.city.trim(),
    region: v.region.trim(),
    postalCode: v.postalCode.trim(),
    country: v.country.trim(),
    displayName,
  };
}

export interface ProfileEditSheetProps {
  user: PortalUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (user: PortalUser) => void;
}

export function ProfileEditSheet({ user, open, onOpenChange, onSaved }: ProfileEditSheetProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<UpdateUserProfileInput>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: portalUserToFormDefaults(user),
  });

  React.useEffect(() => {
    if (open) {
      form.reset(portalUserToFormDefaults(user));
      setServerError(null);
    }
  }, [open, user, form]);

  async function onSubmit(values: UpdateUserProfileInput) {
    setServerError(null);
    const result = await updateCurrentUserProfileAction(values);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    toast.success("Profile saved");
    onSaved(mergeUserFromInput(user, values));
    onOpenChange(false);
    router.refresh();
  }

  const busy = form.formState.isSubmitting;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={sheetContentMediumClass}>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Update your name, contact details, and address.</SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className={sheetFormClass} noValidate>
          <FormServerError message={serverError} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-first">First name</Label>
              <Input id="profile-first" autoComplete="given-name" placeholder="John" {...form.register("firstName")} />
              {form.formState.errors.firstName ? (
                <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-last">Last name</Label>
              <Input id="profile-last" autoComplete="family-name" placeholder="Smith" {...form.register("lastName")} />
              {form.formState.errors.lastName ? (
                <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" type="email" value={user.email} disabled className="bg-muted/50" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input id="profile-phone" type="tel" autoComplete="tel" placeholder="+61 400 000 000" {...form.register("phone")} />
              {form.formState.errors.phone ? (
                <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-website">Website</Label>
              <Input id="profile-website" autoComplete="url" placeholder="https://www.example.com" {...form.register("website")} />
              {form.formState.errors.website ? (
                <p className="text-xs text-destructive">{form.formState.errors.website.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-dob">Date of birth</Label>
              <Input id="profile-dob" type="date" {...form.register("dateOfBirth")} />
              {form.formState.errors.dateOfBirth ? (
                <p className="text-xs text-destructive">{form.formState.errors.dateOfBirth.message}</p>
              ) : null}
            </div>
          </div>

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
