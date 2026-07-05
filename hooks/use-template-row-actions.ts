"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type { TemplateHubRow } from "@/lib/templates/hub-rows";
import {
  cloneContractTemplateAction,
  deleteContractTemplateAction,
  setContractTemplateStageAction,
} from "@/server/actions/contract-templates";
import {
  cloneProposalTemplateAction,
  deleteProposalTemplateAction,
  setProposalTemplateStageAction,
} from "@/server/actions/proposal-templates";
import type { ProposalTemplateStage } from "@/types/proposal-template";

export interface TemplateConfirmMeta {
  title: string;
  description: string;
  destructive: boolean;
}

export function useTemplateRowActions() {
  const router = useRouter();
  const [pendingKey, setPendingKey] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<(() => Promise<void>) | null>(null);
  const [confirmMeta, setConfirmMeta] = React.useState<TemplateConfirmMeta>({
    title: "",
    description: "",
    destructive: true,
  });

  React.useEffect(() => {
    router.refresh();
  }, [router]);

  function openConfirm(
    meta: { title: string; description: string; destructive?: boolean },
    action: () => Promise<void>
  ) {
    setConfirmMeta({
      title: meta.title,
      description: meta.description,
      destructive: meta.destructive ?? true,
    });
    setConfirmAction(() => action);
    setConfirmOpen(true);
  }

  async function deleteRow(row: TemplateHubRow) {
    setPendingKey(row.key);
    const res =
      row.kind === "proposal"
        ? await deleteProposalTemplateAction(row.id)
        : await deleteContractTemplateAction(row.id);
    setPendingKey(null);
    if (!res.ok) throw new Error(res.message);
    router.refresh();
  }

  async function updateStage(row: TemplateHubRow, stage: ProposalTemplateStage) {
    setPendingKey(row.key);
    const res =
      row.kind === "proposal"
        ? await setProposalTemplateStageAction(row.id, stage)
        : await setContractTemplateStageAction(row.id, stage);
    setPendingKey(null);
    if (!res.ok) throw new Error(res.message);
    router.refresh();
  }

  async function cloneRow(row: TemplateHubRow) {
    setPendingKey(row.key);
    if (row.kind === "proposal") {
      const res = await cloneProposalTemplateAction(row.id);
      setPendingKey(null);
      if (!res.ok) throw new Error(res.message);
      router.push(`/admin/templates/${res.templateId}`);
    } else {
      const res = await cloneContractTemplateAction(row.id);
      setPendingKey(null);
      if (!res.ok) throw new Error(res.message);
      router.push(`/admin/templates/contracts/${res.contractTemplateId}`);
    }
    router.refresh();
  }

  function requestDelete(row: TemplateHubRow) {
    const description =
      row.kind === "proposal"
        ? `Delete template "${row.name}"? This cannot be undone.`
        : `Delete contract template "${row.name}"? Proposals that already copied its text are unchanged.`;
    openConfirm({ title: "Delete template", description }, () => deleteRow(row));
  }

  return {
    pendingKey,
    confirmOpen,
    setConfirmOpen,
    confirmMeta,
    confirmAction,
    updateStage,
    cloneRow,
    requestDelete,
  };
}
