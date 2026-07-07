import { Calendar, Globe, Mail, MapPin, Phone } from "lucide-react";

import { SettingsEditButton } from "@/components/features/settings/settings-edit-button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatAddressLines, initialsFromName, websiteHref } from "@/lib/common/format";
import type { PortalUser } from "@/types/user";

function formatDob(iso: string | undefined): string {
  const s = iso?.trim();
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return "";
  const d = new Date(`${s}T12:00:00`);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export interface UserProfileViewProps {
  user: PortalUser;
  onEdit: () => void;
}

export function UserProfileView({ user, onEdit }: UserProfileViewProps) {
  const addressLines = formatAddressLines(user);
  const hasAddress = addressLines.length > 0;
  const dobLabel = formatDob(user.dateOfBirth);
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.displayName?.trim() ||
    user.email;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile details</CardTitle>
        <CardAction>
          <SettingsEditButton onClick={onEdit} ariaLabel="Edit profile details" />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Avatar className="border-background size-20 border-4">
            {user.photoURL ? <AvatarImage src={user.photoURL} alt={displayName} /> : null}
            <AvatarFallback className="text-lg font-semibold">
              {initialsFromName(displayName)}
            </AvatarFallback>
          </Avatar>
          {displayName ? <p className="text-sm font-medium">{displayName}</p> : null}
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">First name</dt>
            <dd className="text-sm">
              {user.firstName?.trim() ? user.firstName.trim() : <span className="text-muted-foreground">—</span>}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last name</dt>
            <dd className="text-sm">
              {user.lastName?.trim() ? user.lastName.trim() : <span className="text-muted-foreground">—</span>}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Mail className="h-3.5 w-3.5" aria-hidden />
              Email
            </dt>
            <dd className="text-sm">
              {user.email ? (
                <a className="text-primary hover:underline" href={`mailto:${user.email}`}>
                  {user.email}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Phone className="h-3.5 w-3.5" aria-hidden />
              Phone
            </dt>
            <dd className="text-sm">
              {user.phone?.trim() ? (
                <a className="text-primary hover:underline" href={`tel:${user.phone.trim()}`}>
                  {user.phone.trim()}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Globe className="h-3.5 w-3.5" aria-hidden />
              Website
            </dt>
            <dd className="text-sm">
              {user.website?.trim() ? (
                <a
                  href={websiteHref(user.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {user.website.trim()}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              Date of birth
            </dt>
            <dd className="text-sm">
              {dobLabel ? dobLabel : <span className="text-muted-foreground">—</span>}
            </dd>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              Address
            </dt>
            <dd className="text-sm leading-relaxed">
              {hasAddress ? (
                <span className="whitespace-pre-line">{addressLines.join("\n")}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
