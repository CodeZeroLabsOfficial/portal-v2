"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  FileText,
  FolderOpen,
  KeyRound,
  ListChecks,
  MessageSquare,
  Sparkles
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { initialsFromName } from "@/lib/common/format";
import {
  CUSTOMER_DETAIL_TAB_MIN_HEIGHT_CLASS,
  type CustomerDetailTab,
  isCustomerDetailTab
} from "@/lib/crm/customer-detail-tabs";
import { customerCrmTypeBadgeDisplay, customerStatusBadgeDisplay } from "@/lib/crm/status-badges";
import { cn } from "@/lib/utils";
import type { CustomerRecord } from "@/types/customer";

export interface CustomerDetailTabPanels {
  overview: React.ReactNode;
  billing: React.ReactNode;
  proposals: React.ReactNode;
  notes: React.ReactNode;
  documents: React.ReactNode;
  tasks: React.ReactNode;
  vault: React.ReactNode;
}

export interface CustomerDetailShellProps {
  customer: CustomerRecord;
  initialTab?: string;
  sidebar: React.ReactNode;
  panels: CustomerDetailTabPanels;
}

export function CustomerDetailShell({ customer, initialTab, sidebar, panels }: CustomerDetailShellProps) {
  const [tab, setTab] = React.useState<CustomerDetailTab>(() =>
    isCustomerDetailTab(initialTab) ? initialTab : "overview"
  );

  const url = customer.avatarUrl?.trim();
  const canImg =
    url &&
    (url.includes("googleusercontent.com") || url.includes("firebasestorage.googleapis.com"));
  const statusBadge = customerStatusBadgeDisplay(customer.status === "archived" ? "archived" : "active");
  const crmTypeBadge = customerCrmTypeBadgeDisplay(customer.crmType);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" asChild>
        <Link href="/admin/customers">
          <ArrowLeft className="size-4" aria-hidden />
          Customers
        </Link>
      </Button>

      <div className="border-border/80 flex min-w-0 items-start gap-4 border-b pb-6">
        <div className="border-border/60 bg-muted ring-border relative size-16 shrink-0 overflow-hidden rounded-xl border ring-1">
          {canImg && url ? (
            <Image src={url} alt="" width={64} height={64} className="size-full object-cover" />
          ) : (
            <span className="text-muted-foreground flex size-full items-center justify-center text-xl font-semibold">
              {initialsFromName(customer.name)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <PageHeader className="items-start" title={customer.name || customer.email} />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={statusBadge.label} variant={statusBadge.variant} />
            <StatusBadge label={crmTypeBadge.label} variant={crmTypeBadge.variant} />
          </div>
        </div>
      </div>

      {sidebar}

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(isCustomerDetailTab(value) ? value : "overview")}
        className="w-full">
        <TabsList className="no-scrollbar h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto bg-muted/30 p-1">
          <TabsTrigger value="overview" className="gap-1.5">
            <Sparkles className="size-3.5" aria-hidden />
            Overview
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5">
            <CreditCard className="size-3.5" aria-hidden />
            Billing
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

        <TabsContent value="overview" className={cn(CUSTOMER_DETAIL_TAB_MIN_HEIGHT_CLASS, "space-y-6")}>
          {panels.overview}
        </TabsContent>
        <TabsContent value="billing" className={cn(CUSTOMER_DETAIL_TAB_MIN_HEIGHT_CLASS, "space-y-6")}>
          {panels.billing}
        </TabsContent>
        <TabsContent value="proposals" className={cn(CUSTOMER_DETAIL_TAB_MIN_HEIGHT_CLASS, "space-y-4")}>
          {panels.proposals}
        </TabsContent>
        <TabsContent value="notes" className={cn(CUSTOMER_DETAIL_TAB_MIN_HEIGHT_CLASS, "space-y-6")}>
          {panels.notes}
        </TabsContent>
        <TabsContent value="documents" className={cn(CUSTOMER_DETAIL_TAB_MIN_HEIGHT_CLASS, "space-y-4")}>
          {panels.documents}
        </TabsContent>
        <TabsContent value="tasks" className={CUSTOMER_DETAIL_TAB_MIN_HEIGHT_CLASS}>
          {panels.tasks}
        </TabsContent>
        <TabsContent value="vault" className={CUSTOMER_DETAIL_TAB_MIN_HEIGHT_CLASS}>
          {panels.vault}
        </TabsContent>
      </Tabs>
    </div>
  );
}
