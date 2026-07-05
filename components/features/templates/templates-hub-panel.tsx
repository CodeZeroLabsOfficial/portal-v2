"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { NewTemplateButtonGroup } from "@/components/features/templates/new-template-button-group";
import { TemplatesGrid } from "@/components/features/templates/templates-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TEMPLATE_HUB_TABS,
  type TemplateHubRow,
  type TemplateHubTab,
} from "@/lib/templates/hub-rows";

export interface TemplatesHubPanelProps {
  rows: TemplateHubRow[];
  localityTimeZone?: string;
}

export function TemplatesHubPanel({ rows, localityTimeZone }: TemplatesHubPanelProps) {
  const [activeTab, setActiveTab] = React.useState<TemplateHubTab>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const defaultCreateKind = activeTab === "all" ? "proposal" : activeTab;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Reusable proposal layouts and contract agreement templates for your team."
        actions={<NewTemplateButtonGroup defaultKind={defaultCreateKind} />}
      />

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <nav className="flex flex-wrap gap-1" aria-label="Template type">
          {TEMPLATE_HUB_TABS.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              className="rounded-lg"
              aria-current={activeTab === tab.id ? "page" : undefined}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </Button>
          ))}
        </nav>

        <div className="relative w-full lg:w-auto">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search templates…"
            className="w-full pl-9 sm:w-64"
            aria-label="Search templates"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <TemplatesGrid
        rows={rows}
        activeTab={activeTab}
        searchQuery={searchQuery}
        localityTimeZone={localityTimeZone}
      />
    </div>
  );
}
