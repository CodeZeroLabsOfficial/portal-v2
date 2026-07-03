"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EllipsisVertical, ExternalLink, Loader2, Trash2 } from "lucide-react";

import {
  ProposalDocumentActions,
  ProposalSavePublishButtons,
} from "@/components/features/proposal/editor/save-publish-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteContractTemplateAction } from "@/server/actions/contract-templates";
import { deleteProposalTemplateAction } from "@/server/actions/proposal-templates";
import { toast } from "sonner";

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

/** Template builder dropdown — standalone (non-embedded) template shell. */
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

export interface TemplateEditorInlineActionsProps extends TemplateEditorActionsMenuProps {}

/** Inline preview / save / publish for the builder top bar (matches proposal CRM actions). */
export function TemplateEditorInlineActions({
  variant,
  templateId,
  contractTemplateId,
  templateName,
  previewHref,
  saving,
  sending,
  saveJustSucceeded,
  publishJustSucceeded,
  onSave,
  onPublish,
}: TemplateEditorInlineActionsProps) {
  const router = useRouter();
  const isContractTemplate = variant === "contract-template";
  const isTemplate = variant === "template";
  const displayName =
    templateName.trim() || (isContractTemplate ? "Untitled contract" : "Untitled template");

  async function handleDelete() {
    const res = isContractTemplate
      ? await deleteContractTemplateAction(contractTemplateId!)
      : await deleteProposalTemplateAction(templateId!);
    if (!res.ok) throw new Error(res.message);
    router.push("/admin/templates");
    router.refresh();
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        asChild
      >
        <Link href={previewHref} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" aria-hidden />
          Preview
        </Link>
      </Button>
      <ProposalSavePublishButtons
        saving={saving}
        sending={sending}
        saveJustSucceeded={saveJustSucceeded}
        publishJustSucceeded={publishJustSucceeded}
        onSave={onSave}
        onPublish={onPublish ?? (() => {})}
        showPublish={isTemplate && Boolean(onPublish)}
      />
      <TemplateEditorDeleteMenu
        displayName={displayName}
        isContractTemplate={isContractTemplate}
        onDelete={handleDelete}
        busy={saving || sending}
      />
    </>
  );
}

function TemplateEditorDeleteMenu({
  displayName,
  isContractTemplate,
  onDelete,
  busy,
}: {
  displayName: string;
  isContractTemplate: boolean;
  onDelete: () => Promise<void>;
  busy: boolean;
}) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteBusy, setDeleteBusy] = React.useState(false);

  async function handleDeleteConfirm() {
    setDeleteBusy(true);
    try {
      await onDelete();
      toast.success("Deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
      throw err;
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={busy || deleteBusy}
            aria-label={`More actions for ${displayName}`}
          >
            {deleteBusy ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
            ) : (
              <EllipsisVertical className="h-4 w-4 text-muted-foreground" aria-hidden />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[10rem]">
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            disabled={deleteBusy}
            onSelect={(e) => {
              e.preventDefault();
              setDeleteOpen(true);
            }}
          >
            <Trash2 aria-hidden />
            Delete template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={isContractTemplate ? "Delete contract template" : "Delete template"}
        description={`Delete “${displayName}”? This cannot be undone.`}
        confirmLabel="Delete template"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
