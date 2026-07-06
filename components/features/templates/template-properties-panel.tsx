"use client";

import * as React from "react";

import { TemplateAuthorDisplay } from "@/components/features/templates/template-author-display";
import { TemplatePropertiesEditSheet } from "@/components/features/templates/template-properties-edit-sheet";
import { SettingsEditButton } from "@/components/features/settings/settings-edit-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  templateCatalogVersionLabel,
  type TemplateCatalogMeta,
} from "@/lib/templates/catalog-meta";
import {
  templateStageBadgeDisplay,
  templateStageBadgeTitle,
} from "@/lib/templates/status-badges";
import type { UserSummary } from "@/lib/users/user-summaries";
import type { ProposalTemplateStage } from "@/types/proposal-template";

export interface TemplatePropertiesPanelProps {
  author?: UserSummary;
  description: string;
  onDescriptionChange: (value: string) => void;
  catalogMeta: TemplateCatalogMeta;
  onCatalogMetaChange: (next: TemplateCatalogMeta) => void;
  stage: ProposalTemplateStage;
}

interface PropertyFieldProps {
  label: string;
  children: React.ReactNode;
}

function PropertyField({ label, children }: PropertyFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function emptyText(value: string | undefined): React.ReactNode {
  const trimmed = value?.trim();
  return trimmed ? trimmed : <span className="text-muted-foreground">—</span>;
}

export function TemplatePropertiesPanel({
  author,
  description,
  onDescriptionChange,
  catalogMeta,
  onCatalogMetaChange,
  stage,
}: TemplatePropertiesPanelProps) {
  const stageBadge = templateStageBadgeDisplay(stage);
  const [editOpen, setEditOpen] = React.useState(false);
  const versionLabel = templateCatalogVersionLabel(catalogMeta);
  const descriptionText = description.trim();

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <SettingsEditButton
            onClick={() => setEditOpen(true)}
            ariaLabel="Edit template properties"
          />
        </div>

        <PropertyField label="Author">
          <TemplateAuthorDisplay author={author} />
        </PropertyField>

        <PropertyField label="Version">
          {versionLabel ? versionLabel : <span className="text-muted-foreground">—</span>}
        </PropertyField>

        <PropertyField label="Subtitle">{emptyText(catalogMeta.subtitle)}</PropertyField>

        <PropertyField label="Description">
          {descriptionText ? (
            <p className="text-muted-foreground whitespace-pre-wrap">{descriptionText}</p>
          ) : (
            <span className="text-muted-foreground">No description provided.</span>
          )}
        </PropertyField>

        <PropertyField label="Classification">{emptyText(catalogMeta.classification)}</PropertyField>

        <PropertyField label="Category">{emptyText(catalogMeta.category)}</PropertyField>

        <PropertyField label="Key features">
          {(catalogMeta.keyFeatures?.length ?? 0) > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {catalogMeta.keyFeatures!.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </PropertyField>

        <PropertyField label="Status">
          <StatusBadge
            label={stageBadge.label}
            variant={stageBadge.variant}
            title={templateStageBadgeTitle(stage)}
          />
        </PropertyField>
      </div>

      <TemplatePropertiesEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        description={description}
        catalogMeta={catalogMeta}
        onSave={(nextDescription, nextCatalogMeta) => {
          onDescriptionChange(nextDescription);
          onCatalogMetaChange(nextCatalogMeta);
        }}
      />
    </>
  );
}
