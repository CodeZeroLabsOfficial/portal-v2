"use client";

import * as React from "react";
import type { ReactNode } from "react";

import type { BlockMenuProfile } from "@/components/features/proposal/blocks/block-editor-registry";
import {
  BlockMenuProfileContext,
  useColumnsInnerCellChrome,
} from "@/components/features/proposal/editor/proposal-block-fields";
import {
  BuilderEmbeddedChromeActions,
  ProposalEditorChrome,
  type ProposalEditShellToolbarProps,
} from "@/components/features/proposal/editor/proposal-editor-chrome";
import {
  scrollBuilderCanvasToBlock,
  useRegisterBuilderCanvasNavigation,
} from "@/components/features/proposal/editor/builder-canvas-navigation";
import { useRegisterBuilderTopBarTitle } from "@/components/features/proposal/editor/builder-top-bar-title";
import { useBuilderTopBarActions } from "@/components/features/proposal/editor/builder-top-bar-actions";
import { RootBlockCanvas } from "@/components/features/proposal/editor/root-block-canvas";
import { TemplatePropertiesPanel } from "@/components/features/templates/template-properties-panel";
import {
  useRegisterBuilderPropertiesDetails,
} from "@/components/features/proposal/editor/builder-properties-details-slot";
import { ProposalBrandingProvider } from "@/components/proposal/proposal-branding-context";
import { EditorCatalogServicesContext, EditorTemplatePricingReadOnlyContext } from "@/components/proposal/editor-catalog-services-context";
import { ProposalEditorLibraryScope } from "@/components/proposal/proposal-editor-library-scope";
import { ContractTemplatePickerProvider } from "@/components/features/templates/contract-template-picker-provider";
import { ProposalDocumentView } from "@/components/proposal/proposal-document-view";
import { ProposalMediaLibraryProvider } from "@/components/proposal/proposal-media-library";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProposalDocumentEditorState } from "@/hooks/use-proposal-document-editor-state";
import { useProposalEditorPersistence } from "@/hooks/use-proposal-editor-persistence";
import { firstRootSplashBlockId } from "@/lib/proposal/blocks";
import { syncProposalBlocksPackageTiersFromCatalog } from "@/lib/proposal/commerce/package-catalog-sync";
import { PROPOSAL_PUBLIC_DOCUMENT_OUTER_CLASSES } from "@/lib/proposal/public/public-layout";
import type { CatalogServicePickerOption } from "@/types/catalog-service";
import type { BlockStyle, ProposalBlock, ProposalBranding, ProposalDocument } from "@/types/proposal";
import { ContractTemplateAgreementPreview } from "@/components/features/templates/contract-template-agreement-preview";
import { EMPTY_TEMPLATE_CATALOG_META } from "@/lib/templates/catalog-meta";
import type { TemplateCatalogMeta } from "@/lib/templates/catalog-meta";
import type { UserSummary } from "@/lib/users/user-summaries";
import type { ProposalTemplateStage } from "@/types/proposal-template";

export type { ProposalEditShellToolbarProps };

export interface ProposalDocumentEditorProps {
  variant?: "proposal" | "template" | "contract-template";
  proposalId?: string;
  templateId?: string;
  contractTemplateId?: string;
  initialTemplateName?: string;
  initialTemplateDescription?: string;
  initialCatalogMeta?: TemplateCatalogMeta;
  initialTemplateAuthor?: UserSummary;
  initialTemplateStage?: ProposalTemplateStage;
  initialAgreementTitle?: string;
  initialDocument: ProposalDocument;
  initialStatus?: string;
  proposalEditShellToolbar?: ProposalEditShellToolbarProps;
  proposalEditMiddleSlot?: ReactNode;
  localityTimeZone?: string;
  catalogServiceOptions?: CatalogServicePickerOption[];
  initialBranding?: ProposalBranding;
  embeddedInBuilder?: boolean;
}

export function ProposalDocumentEditor({
  variant = "proposal",
  proposalId,
  templateId,
  contractTemplateId,
  initialTemplateName = "",
  initialTemplateDescription = "",
  initialCatalogMeta,
  initialTemplateAuthor,
  initialAgreementTitle = "",
  initialDocument,
  initialStatus = "draft",
  initialTemplateStage = "draft",
  proposalEditShellToolbar,
  proposalEditMiddleSlot,
  localityTimeZone,
  catalogServiceOptions = [],
  initialBranding,
  embeddedInBuilder = false,
}: ProposalDocumentEditorProps) {
  const isTemplate = variant === "template";
  const isContractTemplate = variant === "contract-template";
  const isNamedTemplateShell = isTemplate || isContractTemplate;
  const blockMenuProfile: BlockMenuProfile = isContractTemplate ? "contract-template" : "proposal";

  const [templateName, setTemplateName] = React.useState(initialTemplateName);
  const [templateDescription, setTemplateDescription] = React.useState(initialTemplateDescription);
  const [catalogMeta, setCatalogMeta] = React.useState<TemplateCatalogMeta>(
    initialCatalogMeta ?? EMPTY_TEMPLATE_CATALOG_META,
  );
  const [templateStage, setTemplateStage] = React.useState<ProposalTemplateStage>(initialTemplateStage);
  const [agreementTitle, setAgreementTitle] = React.useState(initialAgreementTitle);
  const [templateNameEditing, setTemplateNameEditing] = React.useState(false);
  const templateNameSnapshotRef = React.useRef(initialTemplateName);
  const [branding, setBranding] = React.useState<ProposalBranding | undefined>(initialBranding);
  const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(null);
  const [rootColumnsLayoutEditingId, setRootColumnsLayoutEditingId] = React.useState<string | null>(null);
  const [editorTab, setEditorTab] = React.useState<"edit" | "preview">("edit");
  const rootColumnsChrome = useColumnsInnerCellChrome();

  const {
    blocks,
    updateBlock,
    removeBlock: removeBlockFromDocument,
    addBlockAt,
    moveBlock,
    reorderBlocks,
    duplicateBlock: duplicateBlockInDocument,
    applyBlockStyle,
    patchBlockBackground,
    replaceBlocks,
  } = useProposalDocumentEditorState(initialDocument);

  const proposalTitleFrozenRef = React.useRef<string | null>(null);
  const documentTitle = React.useMemo(() => {
    if (isNamedTemplateShell) {
      return templateName.trim() || (isContractTemplate ? "Untitled contract" : "Untitled template");
    }
    if (proposalTitleFrozenRef.current === null) {
      proposalTitleFrozenRef.current =
        (initialDocument.title ?? "").trim() || "Untitled proposal";
    }
    return proposalTitleFrozenRef.current;
  }, [isNamedTemplateShell, isContractTemplate, templateName, initialDocument.title]);

  const doc: ProposalDocument = React.useMemo(
    () => ({ title: documentTitle, blocks }),
    [documentTitle, blocks],
  );

  const {
    saving,
    sending,
    message,
    saveJustSucceeded,
    publishJustSucceeded,
    save,
    saveAndExitTemplateNameEdit,
    publishTemplate,
    send,
  } = useProposalEditorPersistence({
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
  });

  React.useEffect(() => {
    if (publishJustSucceeded && isTemplate) {
      setTemplateStage("published");
    }
  }, [isTemplate, publishJustSucceeded]);

  React.useEffect(() => {
    if (rootColumnsLayoutEditingId && !blocks.some((b) => b.id === rootColumnsLayoutEditingId)) {
      setRootColumnsLayoutEditingId(null);
    }
  }, [blocks, rootColumnsLayoutEditingId]);

  React.useEffect(() => {
    if (!isTemplate || catalogServiceOptions.length === 0) return;
    replaceBlocks((prev) => syncProposalBlocksPackageTiersFromCatalog(prev, catalogServiceOptions));
  }, [isTemplate, catalogServiceOptions, replaceBlocks]);

  const brandingContextValue = React.useMemo(
    () => ({
      branding,
      firstRootSplashBlockId: firstRootSplashBlockId(blocks),
      onBrandingChange: isTemplate ? setBranding : undefined,
    }),
    [branding, blocks, isTemplate],
  );

  function removeBlock(id: string) {
    removeBlockFromDocument(id);
    setSelectedBlockId((current) => (current === id ? null : current));
    setRootColumnsLayoutEditingId((current) => (current === id ? null : current));
  }

  function duplicateBlock(id: string) {
    duplicateBlockInDocument(id);
    setSelectedBlockId(null);
  }

  function getBlockStyle(block: ProposalBlock): BlockStyle | undefined {
    if (block.type === "packages" || block.type === "pricing") {
      return block.style;
    }
    return undefined;
  }

  const handleTemplateNameStartEdit = React.useCallback(() => {
    templateNameSnapshotRef.current = templateName;
    setTemplateNameEditing(true);
  }, [templateName]);

  const handleTemplateNameCancelEdit = React.useCallback(() => {
    setTemplateName(templateNameSnapshotRef.current);
    setTemplateNameEditing(false);
  }, []);

  const handleTemplateNameConfirmSave = React.useCallback(() => {
    void saveAndExitTemplateNameEdit(() => setTemplateNameEditing(false));
  }, [saveAndExitTemplateNameEdit]);

  const templateNameEmptyLabel = isContractTemplate ? "Untitled contract" : "Untitled template";

  const editorChromeProps: React.ComponentProps<typeof ProposalEditorChrome> = {
    variant,
    embeddedInBuilder,
    templateId,
    contractTemplateId,
    initialTemplateName,
    templateName,
    onTemplateNameChange: setTemplateName,
    templateNameEditing,
    onTemplateNameStartEdit: handleTemplateNameStartEdit,
    onTemplateNameConfirmSave: handleTemplateNameConfirmSave,
    onTemplateNameCancelEdit: handleTemplateNameCancelEdit,
    agreementTitle,
    onAgreementTitleChange: setAgreementTitle,
    proposalEditShellToolbar,
    initialStatus,
    saving,
    sending,
    message,
    saveJustSucceeded,
    publishJustSucceeded,
    onSave: () => void save(),
    onPublish: isTemplate ? () => void publishTemplate() : () => void send(),
  };

  useBuilderTopBarActions(() => {
    if (!embeddedInBuilder) return null;
    return <BuilderEmbeddedChromeActions {...editorChromeProps} />;
  });

  useRegisterBuilderPropertiesDetails(() => {
    if (!embeddedInBuilder || !isNamedTemplateShell) return null;
    return (
      <TemplatePropertiesPanel
        author={initialTemplateAuthor}
        description={templateDescription}
        onDescriptionChange={setTemplateDescription}
        catalogMeta={catalogMeta}
        onCatalogMetaChange={setCatalogMeta}
        stage={templateStage}
      />
    );
  });

  useRegisterBuilderTopBarTitle(
    embeddedInBuilder && isNamedTemplateShell && (templateId || contractTemplateId)
      ? {
          value: templateName,
          emptyLabel: templateNameEmptyLabel,
          editing: templateNameEditing,
          saving,
          onChange: setTemplateName,
          onStartEdit: handleTemplateNameStartEdit,
          onConfirm: handleTemplateNameConfirmSave,
          onCancel: handleTemplateNameCancelEdit,
        }
      : null,
    [
      embeddedInBuilder,
      isNamedTemplateShell,
      templateId,
      contractTemplateId,
      templateName,
      templateNameEmptyLabel,
      templateNameEditing,
      saving,
    ],
  );

  const navigateToBlock = React.useCallback(
    (blockId: string) => {
      setRootColumnsLayoutEditingId((current) => (current !== null && current !== blockId ? null : current));
      setSelectedBlockId(blockId);
      requestAnimationFrame(() => {
        scrollBuilderCanvasToBlock(blockId);
      });
    },
    [],
  );

  useRegisterBuilderCanvasNavigation(
    embeddedInBuilder ? { selectedBlockId, navigateToBlock } : null,
    [embeddedInBuilder, selectedBlockId, navigateToBlock],
  );

  return (
    <EditorCatalogServicesContext.Provider value={catalogServiceOptions}>
      <EditorTemplatePricingReadOnlyContext.Provider value={true}>
        <ProposalEditorLibraryScope>
          <ProposalMediaLibraryProvider>
            <ProposalBrandingProvider value={brandingContextValue}>
              <ContractTemplatePickerProvider>
                <BlockMenuProfileContext.Provider value={blockMenuProfile}>
                  <div className={embeddedInBuilder ? "space-y-0" : "space-y-8"}>
                    {!embeddedInBuilder ? <ProposalEditorChrome {...editorChromeProps} /> : null}

                    {!embeddedInBuilder ? proposalEditMiddleSlot : null}

                    <Tabs
                      value={embeddedInBuilder ? "edit" : editorTab}
                      onValueChange={(value) => {
                        if (embeddedInBuilder) return;
                        setEditorTab(value === "preview" ? "preview" : "edit");
                      }}
                    >
                      {!embeddedInBuilder ? (
                        <TabsList>
                          <TabsTrigger value="edit">Edit blocks</TabsTrigger>
                          <TabsTrigger value="preview">Live preview</TabsTrigger>
                        </TabsList>
                      ) : null}
                      <TabsContent
                        value="edit"
                        className={
                          embeddedInBuilder
                            ? "mt-0 pb-[min(45vh,26rem)] sm:pb-40 md:pb-48"
                            : "mt-4 pb-[min(45vh,26rem)] sm:pb-40 md:pb-48"
                        }
                      >
                        {editorTab === "edit" ? (
                          <RootBlockCanvas
                            blocks={blocks}
                            selectedBlockId={selectedBlockId}
                            onSelectBlock={setSelectedBlockId}
                            rootColumnsLayoutEditingId={rootColumnsLayoutEditingId}
                            setRootColumnsLayoutEditingId={setRootColumnsLayoutEditingId}
                            rootColumnsChrome={rootColumnsChrome}
                            onReorder={reorderBlocks}
                            addBlockAt={addBlockAt}
                            updateBlock={updateBlock}
                            removeBlock={removeBlock}
                            moveBlock={moveBlock}
                            duplicateBlock={duplicateBlock}
                            applyBlockStyle={applyBlockStyle}
                            patchBlockBackground={patchBlockBackground}
                            getBlockStyle={getBlockStyle}
                          />
                        ) : null}
                      </TabsContent>
                      <TabsContent
                        value="preview"
                        className="mt-4 overflow-x-visible rounded-2xl border border-border/70 bg-muted/15 pb-6 pt-0 md:pb-10"
                      >
                        {editorTab === "preview" ? (
                          isContractTemplate ? (
                            <ContractTemplateAgreementPreview
                              agreementTitle={agreementTitle}
                              document={doc}
                            />
                          ) : (
                            <div className={PROPOSAL_PUBLIC_DOCUMENT_OUTER_CLASSES}>
                              <ProposalDocumentView
                                document={doc}
                                branding={branding}
                                localityTimeZone={localityTimeZone}
                                flushTop
                              />
                            </div>
                          )
                        ) : null}
                      </TabsContent>
                    </Tabs>
                  </div>
                </BlockMenuProfileContext.Provider>
              </ContractTemplatePickerProvider>
            </ProposalBrandingProvider>
          </ProposalMediaLibraryProvider>
        </ProposalEditorLibraryScope>
      </EditorTemplatePricingReadOnlyContext.Provider>
    </EditorCatalogServicesContext.Provider>
  );
}
