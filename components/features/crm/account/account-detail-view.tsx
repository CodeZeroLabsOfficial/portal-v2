"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AccountCompanyDetailsCard } from "@/components/features/crm/account/account-company-details-card";
import { AccountEditSheet } from "@/components/features/crm/account/account-edit-sheet";
import { AddCustomerDialog } from "@/components/features/crm/customer/add-customer-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { customerStatusBadgeDisplay } from "@/lib/crm/status-badges";
import { deleteAccountAction } from "@/server/actions/accounts-crm";
import type { AccountDetailAggregate } from "@/types/account";

interface AccountDetailViewProps {
  account: AccountDetailAggregate;
}

export function AccountDetailView({ account }: AccountDetailViewProps) {
  const router = useRouter();
  const [addContactOpen, setAddContactOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const activeBadge = customerStatusBadgeDisplay("active");

  async function handleDelete() {
    const contactCount = account.contacts.length;
    const ok = window.confirm(
      contactCount > 0
        ? `Delete ${account.company} and its ${contactCount} contact${contactCount === 1 ? "" : "s"} (proposals, opportunities, notes, etc.)? This cannot be undone.`
        : `Delete ${account.company}? This cannot be undone.`,
    );
    if (!ok) return;
    setDeleting(true);
    const res = await deleteAccountAction(account.id);
    setDeleting(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success("Account deleted");
    router.push("/admin/accounts");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="outline">
          <Link href="/admin/accounts" aria-label="Back to accounts">
            <ChevronLeft />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={deleting}>
            <Trash2 />
            Delete
          </Button>
          <Button type="button" onClick={() => setEditOpen(true)}>
            <Pencil />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">{account.company}</CardTitle>
            <StatusBadge label={activeBadge.label} variant={activeBadge.variant} />
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
                    c.status === "archived" ? "archived" : "active",
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

      <AccountEditSheet account={account} open={editOpen} onOpenChange={setEditOpen} />

      <AddCustomerDialog
        open={addContactOpen}
        onOpenChange={setAddContactOpen}
        initialAccountId={account.id}
        onCreated={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
