"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";

import { AccountCompanyDetailsCard } from "@/components/features/crm/account/account-company-details-card";
import { AccountEditSheet } from "@/components/features/crm/account/account-edit-sheet";
import { AddCustomerSheet } from "@/components/features/crm/customer/add-customer-sheet";
import { SettingsEditButton } from "@/components/features/settings/settings-edit-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CustomerProfileFormValues } from "@/lib/customer/profile-form-values";
import { customerStatusBadgeDisplay } from "@/lib/crm/status-badges";
import type { AccountDetailAggregate } from "@/server/firestore/crm-customers";

interface AccountDetailViewProps {
  account: AccountDetailAggregate;
}

export function AccountDetailView({ account }: AccountDetailViewProps) {
  const router = useRouter();
  const [addContactOpen, setAddContactOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const activeBadge = customerStatusBadgeDisplay("active");

  const addContactInitialValues = React.useMemo(
    (): Partial<CustomerProfileFormValues> => ({
      company: account.displayName,
      companyPhone: account.companyPhone,
      companyEmail: account.companyEmail,
      companyWebsite: account.companyWebsite,
      companyAbn: account.companyAbn,
      companyAcn: account.companyAcn,
      companyAddressLine1: account.companyAddressLine1 ?? "",
      companyAddressLine2: account.companyAddressLine2 ?? "",
      companyCity: account.companyCity ?? "",
      companyRegion: account.companyRegion ?? "",
      companyPostalCode: account.companyPostalCode ?? "",
      companyCountry: account.companyCountry ?? ""
    }),
    [account]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button asChild variant="outline">
          <Link href="/admin/accounts" aria-label="Back to accounts">
            <ChevronLeft />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">{account.displayName}</CardTitle>
            <StatusBadge label={activeBadge.label} variant={activeBadge.variant} />
            <CardAction>
              <SettingsEditButton onClick={() => setEditOpen(true)} ariaLabel="Edit account" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <AccountCompanyDetailsCard account={account} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardAction>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddContactOpen(true)}>
                <Plus />
                Add
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="p-0">
            {account.contacts.length === 0 ? (
              <p className="text-muted-foreground px-6 py-6 text-sm">No contacts linked yet.</p>
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
                        className="hover:bg-muted/40 flex flex-col gap-0.5 px-6 py-3 transition-colors">
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

      <AccountEditSheet
        account={account}
        accountKey={account.key}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AddCustomerSheet
        open={addContactOpen}
        onOpenChange={setAddContactOpen}
        initialValues={addContactInitialValues}
        onCreated={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
