"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, Loader2, Save, Send } from "lucide-react";

import { ProposalSavePublishButtons } from "@/components/features/proposal/editor/save-publish-actions";
import {
  TemplateEditorActionsMenu,
  TemplateEditorInlineActions,
} from "@/components/features/templates/template-editor-actions-menu";
import { EditableTemplateNameControl } from "@/components/features/proposal/editor/editable-template-name-control";
import { Button } from "@/components/ui/button";

export type ProposalEditShellToolbarProps = {
  customerBackHref: string | null;
  recipientEmail: string | null;
  shareToken: string | null;
};

export interface ProposalEditorChromeProps {
  variant: "proposal" | "template" | "contract-template";
  embeddedInBuilder: boolean;
  templateId?: string;
  contractTemplateId?: string;
  initialTemplateName?: string;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  templateNameEditing: boolean;
  onTemplateNameStartEdit: () => void;
  onTemplateNameConfirmSave: () => void;
  onTemplateNameCancelEdit: () => void;
  proposalEditShellToolbar?: ProposalEditShellToolbarProps;
  initialStatus?: string;
  saving: boolean;
  sending: boolean;
  message: string | null;
  saveJustSucceeded: boolean;
  publishJustSucceeded: boolean;
  onSave: () => void;
  onPublish?: () => void;
}

export function ProposalCrmEditActions({
  shareToken,
  saving,
  sending,
  saveJustSucceeded,
  publishJustSucceeded,
  onSave,
  onPublish,
}: {
  shareToken: string | null;
  saving: boolean;
  sending: boolean;
  saveJustSucceeded: boolean;
  publishJustSucceeded: boolean;
  onSave: () => void;
  onPublish: () => void;
}) {
  return (
    <>
      {shareToken ? (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link
            href={`/p/${encodeURIComponent(shareToken)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Preview
          </Link>
        </Button>
      ) : null}
      <ProposalSavePublishButtons
        saving={saving}
        sending={sending}
        saveJustSucceeded={saveJustSucceeded}
        publishJustSucceeded={publishJustSucceeded}
        onSave={onSave}
        onPublish={onPublish}
      />
    </>
  );
}

/** Save / preview / publish row for the fullscreen builder top bar. */
export function BuilderEmbeddedChromeActions(props: ProposalEditorChromeProps) {
  const {
    variant,
    templateId,
    contractTemplateId,
    initialTemplateName = "",
    templateName,
    proposalEditShellToolbar,
    saving,
    sending,
    saveJustSucceeded,
    publishJustSucceeded,
    onSave,
    onPublish,
    message,
  } = props;

  const isTemplate = variant === "template";
  const isContractTemplate = variant === "contract-template";
  const isNamedTemplateShell = isTemplate || isContractTemplate;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isNamedTemplateShell && (templateId || contractTemplateId) ? (
        <TemplateEditorInlineActions
          variant={isContractTemplate ? "contract-template" : "template"}
          templateId={templateId}
          contractTemplateId={contractTemplateId}
          templateName={templateName.trim() || initialTemplateName || ""}
          previewHref={
            isContractTemplate
              ? `/admin/templates/contracts/${contractTemplateId}/preview`
              : `/admin/templates/${templateId}/preview`
          }
          saving={saving}
          sending={sending}
          saveJustSucceeded={saveJustSucceeded}
          publishJustSucceeded={publishJustSucceeded}
          onSave={onSave}
          onPublish={isTemplate ? onPublish : undefined}
        />
      ) : null}
      {proposalEditShellToolbar ? (
        <ProposalCrmEditActions
          shareToken={proposalEditShellToolbar.shareToken}
          saving={saving}
          sending={sending}
          saveJustSucceeded={saveJustSucceeded}
          publishJustSucceeded={publishJustSucceeded}
          onSave={onSave}
          onPublish={onPublish ?? (() => {})}
        />
      ) : null}
      {message ? <span className="text-muted-foreground text-sm">{message}</span> : null}
    </div>
  );
}

/** Top chrome for template shells, CRM proposal toolbar, and embedded builder actions. */
export function ProposalEditorChrome({
  variant,
  embeddedInBuilder,
  templateId,
  contractTemplateId,
  initialTemplateName = "",
  templateName,
  onTemplateNameChange,
  templateNameEditing,
  onTemplateNameStartEdit,
  onTemplateNameConfirmSave,
  onTemplateNameCancelEdit,
  proposalEditShellToolbar,
  initialStatus = "draft",
  saving,
  sending,
  message,
  saveJustSucceeded,
  publishJustSucceeded,
  onSave,
  onPublish,
}: ProposalEditorChromeProps) {
  const isTemplate = variant === "template";
  const isContractTemplate = variant === "contract-template";
  const isNamedTemplateShell = isTemplate || isContractTemplate;

  if (embeddedInBuilder) {
    return null;
  }

  if (isNamedTemplateShell && (templateId || contractTemplateId)) {
    return (
      <>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/admin/templates">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              All templates
            </Link>
          </Button>
          <div className="flex h-8 min-w-[10rem] flex-1 basis-[14rem] items-center border-b border-border">
            <EditableTemplateNameControl
              appearance="standalone"
              value={templateName}
              emptyLabel={isContractTemplate ? "Untitled contract" : "Untitled template"}
              editing={templateNameEditing}
              saving={saving}
              onChange={onTemplateNameChange}
              onStartEdit={onTemplateNameStartEdit}
              onConfirm={onTemplateNameConfirmSave}
              onCancel={onTemplateNameCancelEdit}
              placeholder={isContractTemplate ? "Contract template name" : "Template name"}
            />
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <TemplateEditorActionsMenu
              variant={isContractTemplate ? "contract-template" : "template"}
              templateId={templateId}
              contractTemplateId={contractTemplateId}
              templateName={templateName.trim() || initialTemplateName || ""}
              previewHref={
                isContractTemplate
                  ? `/admin/templates/contracts/${contractTemplateId}/preview`
                  : `/admin/templates/${templateId}/preview`
              }
              saving={saving}
              sending={sending}
              saveJustSucceeded={saveJustSucceeded}
              publishJustSucceeded={publishJustSucceeded}
              onSave={onSave}
              onPublish={isTemplate ? onPublish : undefined}
            />
          </div>
        </div>
        {message ? <span className="block text-sm text-muted-foreground">{message}</span> : null}
      </>
    );
  }

  if (proposalEditShellToolbar) {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {proposalEditShellToolbar.customerBackHref ? (
              <Button
                variant="ghost"
                size="sm"
                className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href={proposalEditShellToolbar.customerBackHref}>
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back to customer
                </Link>
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ProposalCrmEditActions
              shareToken={proposalEditShellToolbar.shareToken}
              saving={saving}
              sending={sending}
              saveJustSucceeded={saveJustSucceeded}
              publishJustSucceeded={publishJustSucceeded}
              onSave={onSave}
              onPublish={onPublish ?? (() => {})}
            />
          </div>
        </div>
        {message ? <span className="block text-sm text-muted-foreground">{message}</span> : null}
        {initialStatus === "draft" ? (
          <p className="text-xs text-muted-foreground">
            Publish sends the public link, records engagement, and moves a linked opportunity to the Proposal
            stage.
          </p>
        ) : null}
      </>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        disabled={saving}
        onClick={onSave}
        className="min-w-[7rem] gap-2 transition-colors"
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
      {!isTemplate ? (
        <Button
          type="button"
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
      {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
      {!isTemplate && initialStatus === "draft" ? (
        <p className="w-full text-xs text-muted-foreground">
          Publish sends the public link, records engagement, and moves a linked opportunity to the Proposal
          stage.
        </p>
      ) : null}
    </div>
  );
}
