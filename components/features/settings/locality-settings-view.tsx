import { Clock, DollarSign, Languages, MapPin } from "lucide-react";

import { SettingsEditButton } from "@/components/features/settings/settings-edit-button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  TIME_FORMAT_OPTIONS,
} from "@/lib/locality/data";
import type { PortalUser } from "@/types/user";

const APP_DEFAULT = "App default";

function optionLabel(
  options: { value: string; label: string }[],
  value: string | undefined,
): string {
  const v = value?.trim();
  if (!v) return APP_DEFAULT;
  return options.find((o) => o.value === v)?.label ?? v;
}

function regionLabel(code: string | undefined): string {
  const c = code?.trim().toUpperCase();
  if (!c) return APP_DEFAULT;
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    return dn.of(c) ?? c;
  } catch {
    return c;
  }
}

function timeZoneLabel(tz: string | undefined): string {
  const v = tz?.trim();
  if (!v) return APP_DEFAULT;
  return v.replace(/_/g, " ");
}

function currencyLabel(code: string | undefined): string {
  const c = code?.trim().toUpperCase();
  if (!c) return APP_DEFAULT;
  return c;
}

export interface LocalitySettingsViewProps {
  user: PortalUser;
  onEdit: () => void;
}

export function LocalitySettingsView({ user, onEdit }: LocalitySettingsViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional preferences</CardTitle>
        <CardAction>
          <SettingsEditButton onClick={onEdit} ariaLabel="Edit regional preferences" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Time zone
            </dt>
            <dd className="text-sm">{timeZoneLabel(user.timeZone)}</dd>
          </div>
          <div className="space-y-1">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" aria-hidden />
              Currency
            </dt>
            <dd className="text-sm">{currencyLabel(user.currencyCode)}</dd>
          </div>
          <div className="space-y-1">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Languages className="h-3.5 w-3.5" aria-hidden />
              Language
            </dt>
            <dd className="text-sm">{optionLabel(LANGUAGE_OPTIONS, user.languageTag)}</dd>
          </div>
          <div className="space-y-1">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              Country / region
            </dt>
            <dd className="text-sm">{regionLabel(user.localeRegionCode)}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date format</dt>
            <dd className="text-sm">{optionLabel(DATE_FORMAT_OPTIONS, user.dateFormatPreset)}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Time format</dt>
            <dd className="text-sm">{optionLabel(TIME_FORMAT_OPTIONS, user.timeFormatPreset)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
