"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  FileText,
  FolderOpen,
  KeyRound,
  ListChecks,
  MessageSquare,
  Repeat,
  Sparkles
} from "lucide-react";

import { PageBackButton } from "@/components/shared/page-back-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type CustomerDetailTab, isCustomerDetailTab } from "@/lib/crm/customer-detail-tabs";
import { cn } from "@/lib/utils";

export interface CustomerDetailTabPanels {
  overview: React.ReactNode;
  billing: React.ReactNode;
  subscriptions: React.ReactNode;
  proposals: React.ReactNode;
  notes: React.ReactNode;
  documents: React.ReactNode;
  tasks: React.ReactNode;
  vault: React.ReactNode;
}

export interface CustomerDetailShellProps {
  customerId: string;
  initialTab?: string;
  sidebar: React.ReactNode;
  panels: CustomerDetailTabPanels;
}

const TAB_CONTENT_CLASS = "mt-0 space-y-4";

export function CustomerDetailShell({
  customerId,
  initialTab,
  sidebar,
  panels
}: CustomerDetailShellProps) {
  const router = useRouter();
  const [tab, setTab] = React.useState<CustomerDetailTab>(() =>
    isCustomerDetailTab(initialTab) ? initialTab : "overview"
  );

  React.useEffect(() => {
    if (isCustomerDetailTab(initialTab)) {
      setTab(initialTab);
    }
  }, [initialTab]);

  function handleTabChange(value: string) {
    const nextTab = isCustomerDetailTab(value) ? value : "overview";
    setTab(nextTab);
    const path =
      nextTab === "overview"
        ? `/admin/customers/${customerId}`
        : `/admin/customers/${customerId}?tab=${nextTab}`;
    router.replace(path, { scroll: false });
  }

  return (
    <div className="space-y-4">
      <PageBackButton href="/admin/customers" label="Customers" />

      <Tabs value={tab} onValueChange={handleTabChange} className="gap-4">
        <TabsList className="[&_[data-slot=tabs-trigger]]:flex-none">
          <TabsTrigger value="overview" className="gap-1.5">
            <Sparkles className="size-3.5" aria-hidden />
            Overview
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5">
            <CreditCard className="size-3.5" aria-hidden />
            Billing
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-1.5">
            <Repeat className="size-3.5" aria-hidden />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="proposals" className="gap-1.5">
            <FileText className="size-3.5" aria-hidden />
            Proposals
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5">
            <MessageSquare className="size-3.5" aria-hidden />
            Notes
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5">
            <FolderOpen className="size-3.5" aria-hidden />
            Documents
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5">
            <ListChecks className="size-3.5" aria-hidden />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="vault" className="gap-1.5">
            <KeyRound className="size-3.5" aria-hidden />
            Vault
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-1 xl:sticky xl:top-4 xl:self-start">{sidebar}</div>

          <div className="space-y-4 xl:col-span-2">
            <TabsContent value="overview" className={TAB_CONTENT_CLASS}>
              {panels.overview}
            </TabsContent>
            <TabsContent value="billing" className={TAB_CONTENT_CLASS}>
              {panels.billing}
            </TabsContent>
            <TabsContent value="subscriptions" className={TAB_CONTENT_CLASS}>
              {panels.subscriptions}
            </TabsContent>
            <TabsContent value="proposals" className={TAB_CONTENT_CLASS}>
              {panels.proposals}
            </TabsContent>
            <TabsContent value="notes" className={cn(TAB_CONTENT_CLASS, "space-y-6")}>
              {panels.notes}
            </TabsContent>
            <TabsContent value="documents" className={TAB_CONTENT_CLASS}>
              {panels.documents}
            </TabsContent>
            <TabsContent value="tasks" className={TAB_CONTENT_CLASS}>
              {panels.tasks}
            </TabsContent>
            <TabsContent value="vault" className={TAB_CONTENT_CLASS}>
              {panels.vault}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
