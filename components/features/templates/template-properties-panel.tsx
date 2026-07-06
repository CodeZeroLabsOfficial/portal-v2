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
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{label}</h4>
      {children}
    </div>
  );
}

function mutedText(value: string | undefined): React.ReactNode {
  return (
    <p className="text-muted-foreground text-sm">{value?.trim() || "—"}</p>
  );
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
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-2">
          <StatusBadge
            label={stageBadge.label}
            variant={stageBadge.variant}
            title={templateStageBadgeTitle(stage)}
          />
          <SettingsEditButton
            onClick={() => setEditOpen(true)}
            ariaLabel="Edit template properties"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <PropertyField label="Author">
            <TemplateAuthorDisplay author={author} muted />
          </PropertyField>

          <PropertyField label="Version">
            <p className="text-muted-foreground text-sm">{versionLabel ?? "—"}</p>
          </PropertyField>

          <PropertyField label="Classification">
            {mutedText(catalogMeta.classification)}
          </PropertyField>

          <PropertyField label="Category">{mutedText(catalogMeta.category)}</PropertyField>
        </div>

        <PropertyField label="Subtitle">{mutedText(catalogMeta.subtitle)}</PropertyField>

        <PropertyField label="Description">
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">
            {descriptionText || "No description provided."}
          </p>
        </PropertyField>

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
            <p className="text-muted-foreground text-sm">—</p>
          )}
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
