"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { TemplatesGrid } from "@/components/features/templates/templates-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TemplateHubKind, TemplateHubRow } from "@/lib/templates/hub-rows";
import { createContractTemplateAction } from "@/server/actions/contract-templates";
import { createProposalTemplateAction } from "@/server/actions/proposal-templates";

export interface TemplatesHubPanelProps {
  rows: TemplateHubRow[];
  localityTimeZone?: string;
}

function NewProposalTemplateButton() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function handleCreate() {
    setBusy(true);
    const res = await createProposalTemplateAction();
    setBusy(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    router.push(`/admin/templates/${res.templateId}`);
    router.refresh();
  }

  return (
    <Button type="button" size="sm" disabled={busy} onClick={() => void handleCreate()}>
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus />}
      New template
    </Button>
  );
}

function NewContractTemplateButton() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function handleCreate() {
    setBusy(true);
    const res = await createContractTemplateAction();
    setBusy(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    router.push(`/admin/templates/contracts/${res.contractTemplateId}`);
    router.refresh();
  }

  return (
    <Button type="button" size="sm" disabled={busy} onClick={() => void handleCreate()}>
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus />}
      New contract template
    </Button>
  );
}

export function TemplatesHubPanel({ rows, localityTimeZone }: TemplatesHubPanelProps) {
  const [activeTab, setActiveTab] = React.useState<TemplateHubKind>("proposal");
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Reusable proposal layouts and contract agreement templates for your team."
        actions={
          activeTab === "proposal" ? <NewProposalTemplateButton /> : <NewContractTemplateButton />
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TemplateHubKind)}>
          <TabsList>
            <TabsTrigger value="proposal">Proposals</TabsTrigger>
            <TabsTrigger value="contract">Contracts</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full lg:w-auto">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
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
