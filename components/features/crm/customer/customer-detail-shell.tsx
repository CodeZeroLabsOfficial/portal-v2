"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { type CustomerDetailTab, isCustomerDetailTab } from "@/lib/crm/customer-detail-tabs";
import { cn } from "@/lib/utils";

export interface CustomerDetailTabPanels {
  overview: ReactNode;
  billing: ReactNode;
  subscriptions: ReactNode;
  proposals: ReactNode;
  notes: ReactNode;
  documents: ReactNode;
  tasks: ReactNode;
  vault: ReactNode;
}

export interface CustomerDetailShellProps {
  customerId: string;
  /** Hero includes the underline tab triggers and must render inside `Tabs`. */
  hero: ReactNode;
  panels: CustomerDetailTabPanels;
}

const TAB_CONTENT_CLASS = "mt-0 space-y-4";

export function CustomerDetailShell({ customerId, hero, panels }: CustomerDetailShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") ?? undefined;
  const tab: CustomerDetailTab = isCustomerDetailTab(tabParam) ? tabParam : "overview";

  function handleTabChange(value: string) {
    const nextTab = isCustomerDetailTab(value) ? value : "overview";
    const params = new URLSearchParams(searchParams.toString());
    if (nextTab === "overview") params.delete("tab");
    else params.set("tab", nextTab);
    const query = params.toString();
    router.replace(`/admin/customers/${customerId}${query ? `?${query}` : ""}`, { scroll: false });
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className="gap-4">
      {hero}
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
    </Tabs>
  );
}
