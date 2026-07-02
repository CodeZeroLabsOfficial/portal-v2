"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, EllipsisVertical, ExternalLink, Loader2, Save, Send, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteContractTemplateAction } from "@/server/actions/contract-templates";
import { deleteProposalTemplateAction } from "@/server/actions/proposal-templates";

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
  /** Proposal templates only — publish marks the template ready for CRM use. */
  onPublish?: () => void;
}

/** Single top-right Actions menu for the template editor: Preview, Save, Publish, Delete. */
export function TemplateEditorActionsMenu({
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
}: TemplateEditorActionsMenuProps) {
  const router = useRouter();
  const [deleteBusy, setDeleteBusy] = React.useState(false);
  const isContractTemplate = variant === "contract-template";
  const busy = saving || sending || deleteBusy;

  async function handleDelete() {
    const name = templateName.trim() || (isContractTemplate ? "Untitled contract" : "Untitled template");
    const confirmMessage = isContractTemplate
      ? `Delete contract template “${name}”? This cannot be undone.`
      : `Delete template “${name}”? This cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    setDeleteBusy(true);
    const res = isContractTemplate
      ? await deleteContractTemplateAction(contractTemplateId!)
      : await deleteProposalTemplateAction(templateId!);
    setDeleteBusy(false);

    if (!res.ok) {
      window.alert(res.message);
      return;
    }
    router.push("/admin/templates");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={busy}
          aria-label={`Actions for ${templateName.trim() || "template"}`}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
          ) : (
            <EllipsisVertical className="h-4 w-4 text-muted-foreground" aria-hidden />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={previewHref} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden />
            Preview
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          disabled={saving}
          onSelect={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          {saveJustSucceeded && !saving ? (
            <Check className="text-emerald-600 dark:text-emerald-400" aria-hidden />
          ) : (
            <Save aria-hidden />
          )}
          {saveJustSucceeded && !saving ? "Saved" : "Save"}
        </DropdownMenuItem>
        {onPublish ? (
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={sending}
            onSelect={(e) => {
              e.preventDefault();
              onPublish();
            }}
          >
            {publishJustSucceeded && !sending ? (
              <Check className="text-emerald-600 dark:text-emerald-400" aria-hidden />
            ) : (
              <Send aria-hidden />
            )}
            {publishJustSucceeded && !sending ? "Published" : "Publish"}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          disabled={deleteBusy}
          onSelect={(e) => {
            e.preventDefault();
            void handleDelete();
          }}
        >
          <Trash2 aria-hidden />
          Delete template
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
