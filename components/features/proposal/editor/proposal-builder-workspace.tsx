"use client";

import * as React from "react";
import type { ReactNode } from "react";

import { BlockOutlinePanel } from "@/components/features/proposal/editor/block-outline-panel";
import { BuilderCanvasNavigationProvider } from "@/components/features/proposal/editor/builder-canvas-navigation";
import { BuilderTopBarTitleProvider } from "@/components/features/proposal/editor/builder-top-bar-title";
import { BuilderInspectorPanel } from "@/components/features/proposal/editor/builder-inspector-panel";
import {
  BuilderPropertiesDetailsProvider,
  BuilderPropertiesDetailsSlot,
} from "@/components/features/proposal/editor/builder-properties-details-slot";
import { BuilderShell } from "@/components/features/proposal/editor/builder-shell";
import {
  BuilderTopBarActionsProvider,
  BuilderTopBarActionsSlot,
} from "@/components/features/proposal/editor/builder-top-bar-actions";
import { BuilderSidePanelProvider } from "@/components/features/proposal/editor/builder-side-panel-context";
import { DocumentEditorProvider } from "@/components/features/proposal/editor/document-editor-context";
import { BuilderPanel, BuilderTopBar } from "@/components/features/proposal/editor/builder-top-bar";
import { BuilderCanvas } from "@/components/features/proposal/editor/builder-canvas";
import { ProposalDocumentEditorLazy } from "@/components/proposal/proposal-document-editor-lazy";
import type { ProposalDocumentEditorProps } from "@/components/proposal/proposal-document-editor";

function BuilderOutlineFromDocument() {
  return <BlockOutlinePanel />;
}

export interface ProposalBuilderWorkspaceProps extends ProposalDocumentEditorProps {
  backHref: string;
  backLabel: string;
  titleFallback: string;
  inspectorContent?: ReactNode;
  detailsSlot?: React.ReactNode;
  shareSlot?: React.ReactNode;
  brandingSlot?: React.ReactNode;
}

export function ProposalBuilderWorkspace({
  backHref,
  backLabel,
  titleFallback,
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
        <BuilderTopBarTitleProvider>
          <BuilderCanvasNavigationProvider>
            <BuilderSidePanelProvider>
              <BuilderPropertiesDetailsProvider>
              <BuilderShell
                topBar={
                  <BuilderTopBar
                    backHref={backHref}
                    backLabel={backLabel}
                    titleFallback={titleFallback}
                    actions={<BuilderTopBarActionsSlot />}
                  />
                }
                outline={
                  <BuilderPanel title="Outline" side="left">
                    <BuilderOutlineFromDocument />
                  </BuilderPanel>
                }
                canvas={
                  <BuilderCanvas>
                    <ProposalDocumentEditorLazy
                      {...editorProps}
                      variant={variant}
                      initialTemplateName={initialTemplateName}
                      embeddedInBuilder
                      proposalEditMiddleSlot={undefined}
                    />
                  </BuilderCanvas>
                }
                inspector={
                  <BuilderPanel title="Properties" side="right">
                    {inspectorContent ?? (
                      <BuilderInspectorPanel
                        details={detailsSlot ?? <BuilderPropertiesDetailsSlot />}
                        share={shareSlot}
                        branding={brandingSlot}
                      />
                    )}
                  </BuilderPanel>
                }
              />
              </BuilderPropertiesDetailsProvider>
            </BuilderSidePanelProvider>
          </BuilderCanvasNavigationProvider>
        </BuilderTopBarTitleProvider>
      </BuilderTopBarActionsProvider>
    </DocumentEditorProvider>
  );
}
