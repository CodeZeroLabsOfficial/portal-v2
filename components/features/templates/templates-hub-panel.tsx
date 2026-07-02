"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

import { TemplatesListTable } from "@/components/features/templates/templates-list-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import type { TemplateHubRow } from "@/lib/templates/hub-rows";
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
      window.alert(res.message);
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
      window.alert(res.message);
      return;
    }
    router.push(`/admin/templates/contracts/${res.contractTemplateId}`);
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void handleCreate()}>
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus />}
      New contract template
    </Button>
  );
}

export function TemplatesHubPanel({ rows, localityTimeZone }: TemplatesHubPanelProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Create, send, and track dynamic digital proposals."
        actions={
          <>
            <NewProposalTemplateButton />
            <NewContractTemplateButton />
          </>
        }
      />
      <TemplatesListTable rows={rows} localityTimeZone={localityTimeZone} />
    </div>
  );
}
