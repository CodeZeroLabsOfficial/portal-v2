"use client";

import * as React from "react";
import type { ReactNode } from "react";

import { BlockOutlinePanel } from "@/components/features/proposal/editor/block-outline-panel";
import { BuilderInspectorPanel } from "@/components/features/proposal/editor/builder-inspector-panel";
import { BuilderShell } from "@/components/features/proposal/editor/builder-shell";
import {
  BuilderTopBarActionsProvider,
  BuilderTopBarActionsSlot,
} from "@/components/features/proposal/editor/builder-top-bar-actions";
import { DocumentEditorProvider, useDocumentEditor } from "@/components/features/proposal/editor/document-editor-context";
import {
  BuilderPanel,
  BuilderTopBar,
  type BuilderBreadcrumbSegment,
} from "@/components/features/proposal/editor/builder-top-bar";
import { ProposalDocumentEditorLazy } from "@/components/proposal/proposal-document-editor-lazy";
import type { ProposalDocumentEditorProps } from "@/components/proposal/proposal-document-editor";
import { Input } from "@/components/ui/input";

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
  const [templateName, setTemplateName] = React.useState(initialTemplateName);
  const isTemplate = variant === "template" || variant === "contract-template";

  const segments = React.useMemo(() => {
    if (!isTemplate) return breadcrumbSegments;
    const name = templateName.trim() || "Untitled template";
    return [...breadcrumbSegments.slice(0, -1), { label: name }];
  }, [breadcrumbSegments, isTemplate, templateName]);

  return (
    <DocumentEditorProvider initialDocument={editorProps.initialDocument}>
      <BuilderTopBarActionsProvider>
        <BuilderShell
          topBar={
            <BuilderTopBar
              backHref={backHref}
              backLabel={backLabel}
              segments={segments}
              actions={
                <>
                  {isTemplate ? (
                    <Input
                      aria-label="Template name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="h-8 w-[min(16rem,40vw)] text-sm font-medium"
                      placeholder="Template name"
                    />
                  ) : null}
                  <BuilderTopBarActionsSlot />
                </>
              }
            />
          }
          outline={
            <BuilderPanel title="Outline">
              <BuilderOutlineFromDocument />
            </BuilderPanel>
          }
          canvas={
            <div className="px-4 py-6 lg:px-8">
              <ProposalDocumentEditorLazy
                {...editorProps}
                variant={variant}
                initialTemplateName={templateName}
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
      </BuilderTopBarActionsProvider>
    </DocumentEditorProvider>
  );
}
