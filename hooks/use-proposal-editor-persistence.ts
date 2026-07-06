"use client";

import * as React from "react";

import { contractTemplateDocumentToHtml } from "@/lib/contract-template/document";
import { saveProposalDocumentAction, sendProposalAction } from "@/server/actions/proposal-builder";
import {
  saveProposalTemplateAction,
  setProposalTemplateStageAction,
} from "@/server/actions/proposal-templates";
import { saveContractTemplateAction } from "@/server/actions/contract-templates";
import type { ProposalBranding, ProposalDocument } from "@/types/proposal";

export interface UseProposalEditorPersistenceOptions {
  variant: "proposal" | "template" | "contract-template";
  proposalId?: string;
  templateId?: string;
  contractTemplateId?: string;
  documentTitle: string;
  doc: ProposalDocument;
  templateName: string;
  templateDescription: string;
  catalogMeta: import("@/lib/templates/catalog-meta").TemplateCatalogMeta;
  agreementTitle: string;
  branding?: ProposalBranding;
}

export interface ProposalEditorPersistence {
  saving: boolean;
  sending: boolean;
  message: string | null;
  saveJustSucceeded: boolean;
  publishJustSucceeded: boolean;
  setMessage: React.Dispatch<React.SetStateAction<string | null>>;
  save: () => Promise<void>;
  saveAndExitTemplateNameEdit: (onExit: () => void) => Promise<void>;
  publishTemplate: () => Promise<void>;
  send: () => Promise<void>;
}

/** Save, publish, and send flows for proposal and template builders. */
export function useProposalEditorPersistence({
  variant,
  proposalId,
  templateId,
  contractTemplateId,
  documentTitle,
  doc,
  templateName,
  templateDescription,
  catalogMeta,
  agreementTitle,
  branding,
}: UseProposalEditorPersistenceOptions): ProposalEditorPersistence {
  const isTemplate = variant === "template";
  const isContractTemplate = variant === "contract-template";
  const isNamedTemplateShell = isTemplate || isContractTemplate;

  const [saving, setSaving] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [publishJustSucceeded, setPublishJustSucceeded] = React.useState(false);
  const [saveJustSucceeded, setSaveJustSucceeded] = React.useState(false);
  const publishSuccessResetRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveSuccessResetRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (publishSuccessResetRef.current) clearTimeout(publishSuccessResetRef.current);
      if (saveSuccessResetRef.current) clearTimeout(saveSuccessResetRef.current);
    };
  }, []);

  const markSaveSucceeded = React.useCallback(() => {
    setSaveJustSucceeded(true);
    saveSuccessResetRef.current = setTimeout(() => {
      saveSuccessResetRef.current = null;
      setSaveJustSucceeded(false);
    }, 1800);
  }, []);

  const markPublishSucceeded = React.useCallback(() => {
    setPublishJustSucceeded(true);
    publishSuccessResetRef.current = setTimeout(() => {
      publishSuccessResetRef.current = null;
      setPublishJustSucceeded(false);
    }, 1800);
  }, []);

  const save = React.useCallback(async () => {
    setSaving(true);
    setMessage(null);
    if (isContractTemplate) {
      if (!contractTemplateId) {
        setSaving(false);
        setMessage("Missing contract template id.");
        return;
      }
      const { introHtml, legalHtml } = contractTemplateDocumentToHtml(doc);
      const res = await saveContractTemplateAction({
        contractTemplateId,
        name: templateName.trim() || "Untitled contract",
        description: templateDescription.trim() || undefined,
        agreementTitle: agreementTitle.trim() || "Services Agreement",
        document: doc,
        introHtml,
        legalHtml,
        catalogMeta,
      });
      setSaving(false);
      setMessage(res.ok ? "Contract template saved." : res.message);
      return;
    }
    if (isTemplate) {
      if (!templateId) {
        setSaving(false);
        setMessage("Missing template id.");
        return;
      }
      const res = await saveProposalTemplateAction({
        templateId,
        name: templateName.trim() || "Untitled template",
        description: templateDescription.trim() || undefined,
        title: documentTitle,
        document: doc,
        branding,
        catalogMeta,
      });
      setSaving(false);
      setMessage(res.ok ? null : res.message);
      if (res.ok) markSaveSucceeded();
      return;
    }
    if (!proposalId) {
      setSaving(false);
      setMessage("Missing proposal id.");
      return;
    }
    if (saveSuccessResetRef.current) {
      clearTimeout(saveSuccessResetRef.current);
      saveSuccessResetRef.current = null;
    }
    setSaveJustSucceeded(false);
    const res = await saveProposalDocumentAction({
      proposalId,
      title: documentTitle,
      document: doc,
    });
    setSaving(false);
    setMessage(res.ok ? null : res.message);
    if (res.ok) markSaveSucceeded();
  }, [
    agreementTitle,
    branding,
    contractTemplateId,
    doc,
    documentTitle,
    templateDescription,
    catalogMeta,
    isContractTemplate,
    isTemplate,
    markSaveSucceeded,
    proposalId,
    templateId,
    templateName,
  ]);

  const saveAndExitTemplateNameEdit = React.useCallback(
    async (onExit: () => void) => {
      if (!isNamedTemplateShell || (!templateId && !contractTemplateId)) return;
      onExit();
      await save();
    },
    [contractTemplateId, isNamedTemplateShell, save, templateId],
  );

  const publishTemplate = React.useCallback(async () => {
    if (!isTemplate || !templateId) return;
    if (publishSuccessResetRef.current) {
      clearTimeout(publishSuccessResetRef.current);
      publishSuccessResetRef.current = null;
    }
    setPublishJustSucceeded(false);
    setSending(true);
    setMessage(null);
    const saved = await saveProposalTemplateAction({
      templateId,
      name: templateName.trim() || "Untitled template",
      description: templateDescription.trim() || undefined,
      title: documentTitle,
      document: doc,
      branding,
      catalogMeta,
    });
    if (!saved.ok) {
      setSending(false);
      setMessage(saved.message);
      return;
    }
    const staged = await setProposalTemplateStageAction(templateId, "published");
    setSending(false);
    if (!staged.ok) {
      setMessage(staged.message);
      return;
    }
    setMessage(null);
    markPublishSucceeded();
  }, [
    branding,
    doc,
    documentTitle,
    templateDescription,
    catalogMeta,
    isTemplate,
    markPublishSucceeded,
    templateId,
    templateName,
  ]);

  const send = React.useCallback(async () => {
    if (isNamedTemplateShell || !proposalId) return;
    if (publishSuccessResetRef.current) {
      clearTimeout(publishSuccessResetRef.current);
      publishSuccessResetRef.current = null;
    }
    setPublishJustSucceeded(false);
    setSending(true);
    setMessage(null);
    const saved = await saveProposalDocumentAction({ proposalId, title: documentTitle, document: doc });
    if (!saved.ok) {
      setSending(false);
      setMessage(saved.message);
      return;
    }
    const sent = await sendProposalAction(proposalId);
    setSending(false);
    setMessage(sent.ok ? null : sent.message);
    if (sent.ok) markPublishSucceeded();
  }, [doc, documentTitle, isNamedTemplateShell, markPublishSucceeded, proposalId]);

  return {
    saving,
    sending,
    message,
    saveJustSucceeded,
    publishJustSucceeded,
    setMessage,
    save,
    saveAndExitTemplateNameEdit,
    publishTemplate,
    send,
  };
}
