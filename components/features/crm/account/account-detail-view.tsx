import Link from "next/link";
import { ArrowLeft, Building2, Pencil, Users } from "lucide-react";

import { AccountCompanyDetailsCard } from "@/components/features/crm/account/account-company-details-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { customerStatusBadgeDisplay } from "@/lib/crm/status-badges";
import type { AccountDetailAggregate } from "@/server/firestore/crm-customers";

interface AccountDetailViewProps {
  account: AccountDetailAggregate;
}

export function AccountDetailView({ account }: AccountDetailViewProps) {
  const contactCount = account.contacts.length;
  const activeBadge = customerStatusBadgeDisplay("active");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" asChild>
          <Link href="/admin/accounts">
            <ArrowLeft className="size-4" aria-hidden />
            Accounts
          </Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/admin/accounts/${account.key}/edit`}>
            <Pencil className="size-3.5" aria-hidden />
            Edit
          </Link>
        </Button>
      </div>

      <div className="flex min-w-0 items-start gap-4">
        <span
          className="bg-primary/15 text-primary ring-primary/25 inline-flex size-12 shrink-0 items-center justify-center rounded-xl ring-1"
          aria-hidden>
          <Building2 className="size-6 stroke-[1.5]" />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <PageHeader className="items-start" title={account.displayName} />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={activeBadge.label} variant={activeBadge.variant} />
            {contactCount === 1 ? (
              <Link href={`/admin/customers/${account.contacts[0]!.id}`}>
                <StatusBadge label="1 contact" variant="secondary" className="cursor-pointer" />
              </Link>
            ) : (
              <StatusBadge
                label={`${contactCount} contact${contactCount === 1 ? "" : "s"}`}
                variant="secondary"
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AccountCompanyDetailsCard account={account} accountKey={account.key} />

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="text-muted-foreground size-5" aria-hidden />
              Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {account.contacts.length === 0 ? (
              <p className="text-muted-foreground px-4 py-6 text-sm">No contacts linked yet.</p>
            ) : (
              <ul className="divide-y">
                {account.contacts.map((c) => {
                  const statusDisplay = customerStatusBadgeDisplay(
                    c.status === "archived" ? "archived" : "active"
                  );
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="hover:bg-muted/40 flex flex-col gap-0.5 px-4 py-3 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span className="min-w-0 truncate font-medium">
                            {c.name.trim() || c.email}
                          </span>
                          <StatusBadge
                            label={statusDisplay.label}
                            variant={statusDisplay.variant}
                            className="shrink-0 capitalize"
                          />
                        </div>
                        <span className="text-muted-foreground truncate text-xs">{c.email}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
