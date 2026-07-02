import Link from "next/link";
import { Building2, FileText, Globe, Mail, MapPin, Pencil, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatAddressLines, websiteHref } from "@/lib/common/format";
import type { WorkspaceCompanySettings } from "@/types/organization";

export interface CompanySettingsViewProps {
  settings: WorkspaceCompanySettings;
}

export function CompanySettingsView({ settings }: CompanySettingsViewProps) {
  const addressLines = formatAddressLines(settings);
  const hasAddress = addressLines.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" aria-hidden />
          Company details
        </CardTitle>
        <CardDescription>Legal entity and contact information for your workspace.</CardDescription>
        <CardAction>
          <Button variant="secondary" size="sm" className="gap-1.5" asChild>
            <Link href="/admin/settings/company/edit">
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Edit
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Company name</dt>
              <dd className="text-sm">
                {settings.name.trim() ? settings.name.trim() : <span className="text-muted-foreground">—</span>}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Phone className="h-3.5 w-3.5" aria-hidden />
                Phone
              </dt>
              <dd className="text-sm">
                {settings.phone.trim() ? (
                  <a className="text-primary hover:underline" href={`tel:${settings.phone.trim()}`}>
                    {settings.phone.trim()}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                Email
              </dt>
              <dd className="text-sm">
                {settings.email.trim() ? (
                  <a className="text-primary hover:underline" href={`mailto:${settings.email.trim()}`}>
                    {settings.email.trim()}
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
                {settings.website.trim() ? (
                  <a
                    href={websiteHref(settings.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {settings.website.trim()}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <FileText className="h-3.5 w-3.5" aria-hidden />
                ACN
              </dt>
              <dd className="text-sm">
                {settings.acn.trim() ? settings.acn.trim() : <span className="text-muted-foreground">—</span>}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <FileText className="h-3.5 w-3.5" aria-hidden />
                ABN
              </dt>
              <dd className="text-sm">
                {settings.abn.trim() ? settings.abn.trim() : <span className="text-muted-foreground">—</span>}
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
