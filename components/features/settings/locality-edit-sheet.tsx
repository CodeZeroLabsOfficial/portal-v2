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
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  TIME_FORMAT_OPTIONS,
} from "@/lib/locality/data";
import { ISO3166_ALPHA2_CODES } from "@/lib/locality/iso3166-alpha2-codes";
import {
  updateLocalityPreferencesSchema,
  type UpdateLocalityPreferencesInput,
} from "@/lib/schemas/locality-preferences";
import { updateLocalityPreferencesAction } from "@/server/actions/locality-preferences";
import { cn } from "@/lib/utils";
import type { PortalUser } from "@/types/user";

const selectClassName = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

const DATE_PRESET_ALLOW = new Set(["locale", "iso", "dmy", "mdy", "long", ""]);
const TIME_PRESET_ALLOW = new Set(["12", "24", ""]);

function portalUserToLocalityDefaults(user: PortalUser): UpdateLocalityPreferencesInput {
  const rawDate = user.dateFormatPreset ?? "";
  const rawTime = user.timeFormatPreset ?? "";
  return {
    timeZone: user.timeZone ?? "",
    languageTag: user.languageTag ?? "",
    dateFormatPreset: (DATE_PRESET_ALLOW.has(rawDate) ? rawDate : "") as UpdateLocalityPreferencesInput["dateFormatPreset"],
    timeFormatPreset: (TIME_PRESET_ALLOW.has(rawTime) ? rawTime : "") as UpdateLocalityPreferencesInput["timeFormatPreset"],
    localeRegionCode: user.localeRegionCode ?? "",
    currencyCode: user.currencyCode ?? "",
  };
}

function mergeUserFromInput(current: PortalUser, v: UpdateLocalityPreferencesInput): PortalUser {
  return {
    ...current,
    timeZone: v.timeZone.trim(),
    languageTag: v.languageTag.trim(),
    dateFormatPreset: v.dateFormatPreset,
    timeFormatPreset: v.timeFormatPreset,
    localeRegionCode: v.localeRegionCode.trim().toUpperCase(),
    currencyCode: v.currencyCode.trim().toUpperCase(),
  };
}

export interface LocalityEditSheetProps {
  user: PortalUser;
  timeZones: string[];
  currencyCodes: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (user: PortalUser) => void;
}

export function LocalityEditSheet({
  user,
  timeZones,
  currencyCodes,
  open,
  onOpenChange,
  onSaved,
}: LocalityEditSheetProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const countryOptions = React.useMemo(() => {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    return [...ISO3166_ALPHA2_CODES]
      .map((code) => ({ value: code, label: dn.of(code) ?? code }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const regionSelectOptions = React.useMemo(() => {
    const code = user.localeRegionCode?.trim().toUpperCase();
    const valid = ISO3166_ALPHA2_CODES as readonly string[];
    if (code && !valid.includes(code)) {
      const dn = new Intl.DisplayNames(["en"], { type: "region" });
      return [...countryOptions, { value: code, label: dn.of(code) ?? code }].sort((a, b) =>
        a.label.localeCompare(b.label),
      );
    }
    return countryOptions;
  }, [countryOptions, user.localeRegionCode]);

  const languageOptions = React.useMemo(() => {
    const tag = user.languageTag?.trim();
    const base = LANGUAGE_OPTIONS;
    if (tag && !base.some((o) => o.value === tag)) {
      return [...base, { value: tag, label: tag }].sort((a, b) => a.label.localeCompare(b.label));
    }
    return base;
  }, [user.languageTag]);

  const timeZoneOptions = React.useMemo(() => {
    const tz = user.timeZone?.trim();
    if (tz && !timeZones.includes(tz)) {
      return [tz, ...timeZones];
    }
    return timeZones;
  }, [timeZones, user.timeZone]);

  const currencyOptionsList = React.useMemo(() => {
    const c = user.currencyCode?.trim().toUpperCase();
    if (c && !currencyCodes.includes(c)) {
      return [c, ...currencyCodes];
    }
    return currencyCodes;
  }, [currencyCodes, user.currencyCode]);

  const form = useForm<UpdateLocalityPreferencesInput>({
    resolver: zodResolver(updateLocalityPreferencesSchema),
    defaultValues: portalUserToLocalityDefaults(user),
  });

  React.useEffect(() => {
    if (open) {
      form.reset(portalUserToLocalityDefaults(user));
      setServerError(null);
    }
  }, [open, user, form]);

  async function onSubmit(values: UpdateLocalityPreferencesInput) {
    setServerError(null);
    const result = await updateLocalityPreferencesAction(values);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    toast.success("Regional preferences saved");
    onSaved(mergeUserFromInput(user, values));
    onOpenChange(false);
    router.refresh();
  }

  const busy = form.formState.isSubmitting;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={sheetContentMediumClass}>
        <SheetHeader>
          <SheetTitle>Edit regional preferences</SheetTitle>
          <SheetDescription>
            Time zone, language, formats, region, and currency used across your workspace.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className={sheetFormClass} noValidate>
          <FormServerError message={serverError} />

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="locality-tz">Time zone</Label>
              <select id="locality-tz" className={selectClassName} {...form.register("timeZone")}>
                <option value="">App default</option>
                {timeZoneOptions.map((z) => (
                  <option key={z} value={z}>
                    {z.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Used for timestamps, deadlines, and calendar views.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locality-currency">Currency</Label>
              <select id="locality-currency" className={selectClassName} {...form.register("currencyCode")}>
                <option value="">App default</option>
                {currencyOptionsList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">ISO 4217 code (e.g. AUD for Australian dollar).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locality-lang">Language</Label>
              <select id="locality-lang" className={selectClassName} {...form.register("languageTag")}>
                <option value="">App default</option>
                {languageOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locality-region">Country / region</Label>
              <select id="locality-region" className={selectClassName} {...form.register("localeRegionCode")}>
                <option value="">App default</option>
                {regionSelectOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">ISO locale region (e.g. Australia → AU).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locality-date">Date format</Label>
              <select id="locality-date" className={selectClassName} {...form.register("dateFormatPreset")}>
                <option value="">App default</option>
                {DATE_FORMAT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locality-time">Time format</Label>
              <select id="locality-time" className={selectClassName} {...form.register("timeFormatPreset")}>
                <option value="">App default</option>
                {TIME_FORMAT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
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
