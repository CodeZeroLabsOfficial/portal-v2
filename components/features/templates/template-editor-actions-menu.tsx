"use client";

import { useRouter } from "next/navigation";

import { deleteContractTemplateAction } from "@/server/actions/contract-templates";
import { deleteProposalTemplateAction } from "@/server/actions/proposal-templates";
import { ProposalDocumentActions } from "@/components/features/proposal/editor/save-publish-actions";

export interface TemplateEditorActionsMenuProps {
  variant: "template" | "contract-template";
  templateId?: string;
  contractTemplateId?: string;
  templateName: string;
  previewHref: string;
  saving: boolean;
  sending: boolean;
  saveJustSucceeded: boolean;
  publishJustSucceeded: boolean;
  onSave: () => void;
  onPublish?: () => void;
}

/** Template builder actions — delegates to shared ProposalDocumentActions. */
export function TemplateEditorActionsMenu(props: TemplateEditorActionsMenuProps) {
  const router = useRouter();
  const isContractTemplate = props.variant === "contract-template";
  const displayName =
    props.templateName.trim() || (isContractTemplate ? "Untitled contract" : "Untitled template");

  async function handleDelete() {
    const res = isContractTemplate
      ? await deleteContractTemplateAction(props.contractTemplateId!)
      : await deleteProposalTemplateAction(props.templateId!);
    if (!res.ok) throw new Error(res.message);
    router.push("/admin/templates");
    router.refresh();
  }

  return (
    <ProposalDocumentActions
      previewHref={props.previewHref}
      saving={props.saving}
      sending={props.sending}
      saveJustSucceeded={props.saveJustSucceeded}
      publishJustSucceeded={props.publishJustSucceeded}
      onSave={props.onSave}
      onPublish={props.onPublish}
      ariaLabel={`Actions for ${displayName}`}
      deleteLabel="Delete template"
      deleteConfirmTitle={
        isContractTemplate ? "Delete contract template" : "Delete template"
      }
      deleteConfirmDescription={`Delete “${displayName}”? This cannot be undone.`}
      onDelete={handleDelete}
    />
  );
}
