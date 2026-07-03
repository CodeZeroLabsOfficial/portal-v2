"use client";

import * as React from "react";
import type { ReactNode } from "react";

import { BlockOutlinePanel } from "@/components/features/proposal/editor/block-outline-panel";
import { BuilderBreadcrumbTitleProvider } from "@/components/features/proposal/editor/builder-breadcrumb-title";
import { BuilderInspectorPanel } from "@/components/features/proposal/editor/builder-inspector-panel";
import { BuilderShell } from "@/components/features/proposal/editor/builder-shell";
import {
  BuilderTopBarActionsProvider,
  BuilderTopBarActionsSlot,
} from "@/components/features/proposal/editor/builder-top-bar-actions";
import { BuilderSidePanelProvider } from "@/components/features/proposal/editor/builder-side-panel-context";
import { DocumentEditorProvider, useDocumentEditor } from "@/components/features/proposal/editor/document-editor-context";
import {
  BuilderPanel,
  BuilderTopBar,
  type BuilderBreadcrumbSegment,
} from "@/components/features/proposal/editor/builder-top-bar";
import { ProposalDocumentEditorLazy } from "@/components/proposal/proposal-document-editor-lazy";
import type { ProposalDocumentEditorProps } from "@/components/proposal/proposal-document-editor";

function BuilderOutlineFromDocument() {
  const { document } = useDocumentEditor();
  return <BlockOutlinePanel blocks={document.blocks} />;
}

export interface ProposalBuilderWorkspaceProps extends ProposalDocumentEditorProps {
  backHref: string;
  backLabel: string;
  breadcrumbSegments: BuilderBreadcrumbSegment[];
  inspectorContent?: ReactNode;
  detailsSlot?: React.ReactNode;
  shareSlot?: React.ReactNode;
  brandingSlot?: React.ReactNode;
}

export function ProposalBuilderWorkspace({
  backHref,
  backLabel,
  breadcrumbSegments,
  inspectorContent,
  detailsSlot,
  shareSlot,
  brandingSlot,
  variant = "proposal",
  initialTemplateName = "",
  ...editorProps
}: ProposalBuilderWorkspaceProps) {
  return (
    <DocumentEditorProvider initialDocument={editorProps.initialDocument}>
      <BuilderTopBarActionsProvider>
        <BuilderBreadcrumbTitleProvider>
          <BuilderSidePanelProvider>
            <BuilderShell
              topBar={
                <BuilderTopBar
                  backHref={backHref}
                  backLabel={backLabel}
                  segments={breadcrumbSegments}
                  actions={<BuilderTopBarActionsSlot />}
                />
              }
              outline={
                <BuilderPanel title="Outline">
                  <BuilderOutlineFromDocument />
                </BuilderPanel>
              }
              canvas={
                <div className="px-4 pb-6 pt-12 lg:px-8">
                  <ProposalDocumentEditorLazy
                    {...editorProps}
                    variant={variant}
                    initialTemplateName={initialTemplateName}
                    embeddedInBuilder
                    proposalEditMiddleSlot={undefined}
                  />
                </div>
              }
              inspector={
                <BuilderPanel title="Inspector">
                  {inspectorContent ?? (
                    <BuilderInspectorPanel
                      details={detailsSlot}
                      share={shareSlot}
                      branding={brandingSlot}
                    />
                  )}
                </BuilderPanel>
              }
            />
          </BuilderSidePanelProvider>
        </BuilderBreadcrumbTitleProvider>
      </BuilderTopBarActionsProvider>
    </DocumentEditorProvider>
  );
}
