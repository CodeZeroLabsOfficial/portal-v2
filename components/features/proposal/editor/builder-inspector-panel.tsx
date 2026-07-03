"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface BuilderInspectorPanelProps {
  details?: React.ReactNode;
  share?: React.ReactNode;
  branding?: React.ReactNode;
  block?: React.ReactNode;
}

export function BuilderInspectorPanel({
  details,
  share,
  branding,
  block,
}: BuilderInspectorPanelProps) {
  const tabs = [
    details ? { id: "details", label: "Details", content: details } : null,
    share ? { id: "share", label: "Share", content: share } : null,
    branding ? { id: "branding", label: "Branding", content: branding } : null,
    block ? { id: "block", label: "Block", content: block } : null,
  ].filter(Boolean) as { id: string; label: string; content: React.ReactNode }[];

  if (tabs.length === 0) {
    return <p className="text-muted-foreground text-sm">No inspector panels for this document.</p>;
  }

  return (
    <Tabs defaultValue={tabs[0]?.id}>
      <TabsList className="w-full">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="flex-1 text-sm">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-4 space-y-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
