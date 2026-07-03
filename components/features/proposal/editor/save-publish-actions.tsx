"use client";

import * as React from "react";
import Link from "next/link";
import { Check, EllipsisVertical, ExternalLink, Loader2, Save, Send, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export interface ProposalDocumentActionsProps {
  previewHref?: string;
  previewLabel?: string;
  saving: boolean;
  sending?: boolean;
  saveJustSucceeded: boolean;
  publishJustSucceeded?: boolean;
  onSave: () => void;
  onPublish?: () => void;
  onDelete?: () => Promise<void>;
  deleteLabel?: string;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: string;
  busy?: boolean;
  ariaLabel?: string;
}

export interface ProposalSavePublishButtonsProps {
  saving: boolean;
  sending: boolean;
  saveJustSucceeded: boolean;
  publishJustSucceeded: boolean;
  onSave: () => void;
  onPublish: () => void;
  showPublish?: boolean;
}

/** Inline Save + Publish buttons — proposal CRM editor toolbar row. */
export function ProposalSavePublishButtons({
  saving,
  sending,
  saveJustSucceeded,
  publishJustSucceeded,
  onSave,
  onPublish,
  showPublish = true,
}: ProposalSavePublishButtonsProps) {
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={saving}
        onClick={onSave}
        className="min-w-[7rem] gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={saveJustSucceeded && !saving ? "Saved" : "Save"}
      >
        {saving ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        ) : saveJustSucceeded ? (
          <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
        ) : (
          <Save className="h-4 w-4 shrink-0" aria-hidden />
        )}
        {saveJustSucceeded && !saving ? "Saved" : "Save"}
      </Button>
      {showPublish ? (
        <Button
          type="button"
          size="sm"
          disabled={sending}
          onClick={onPublish}
          className="min-w-[5.5rem] gap-2 transition-colors"
          aria-label={publishJustSucceeded && !sending ? "Published" : "Publish"}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          ) : publishJustSucceeded ? (
            <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
          ) : (
            <Send className="h-4 w-4 shrink-0" aria-hidden />
          )}
          {publishJustSucceeded && !sending ? "Published" : "Publish"}
        </Button>
      ) : null}
    </>
  );
}

/** Shared save / publish / preview / delete menu for proposal and template builders. */
export function ProposalDocumentActions({
  previewHref,
  previewLabel = "Preview",
  saving,
  sending = false,
  saveJustSucceeded,
  publishJustSucceeded = false,
  onSave,
  onPublish,
  onDelete,
  deleteLabel = "Delete",
  deleteConfirmTitle = "Delete document",
  deleteConfirmDescription = "This cannot be undone.",
  busy = false,
  ariaLabel = "Document actions",
}: ProposalDocumentActionsProps) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteBusy, setDeleteBusy] = React.useState(false);
  const isBusy = busy || saving || sending || deleteBusy;

  async function handleDeleteConfirm() {
    if (!onDelete) return;
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
            size="icon"
            className="h-8 w-8"
            disabled={isBusy}
            aria-label={ariaLabel}
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
            ) : (
              <EllipsisVertical className="h-4 w-4 text-muted-foreground" aria-hidden />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[10rem]">
          {previewHref ? (
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={previewHref} target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden />
                {previewLabel}
              </Link>
            </DropdownMenuItem>
          ) : null}
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
          {onDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                disabled={deleteBusy}
                onSelect={(e) => {
                  e.preventDefault();
                  setDeleteOpen(true);
                }}
              >
                <Trash2 aria-hidden />
                {deleteLabel}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {onDelete ? (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={deleteConfirmTitle}
          description={deleteConfirmDescription}
          confirmLabel={deleteLabel}
          destructive
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </>
  );
}
