"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TemplateCatalogMeta } from "@/lib/templates/catalog-meta";
import {
  templateStageBadgeDisplay,
  templateStageBadgeTitle,
} from "@/lib/templates/status-badges";
import type { ProposalTemplateStage } from "@/types/proposal-template";

export interface TemplatePropertiesPanelProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  catalogMeta: TemplateCatalogMeta;
  onCatalogMetaChange: (next: TemplateCatalogMeta) => void;
  stage: ProposalTemplateStage;
}

function updateCatalogField(
  meta: TemplateCatalogMeta,
  onChange: (next: TemplateCatalogMeta) => void,
  field: keyof TemplateCatalogMeta,
  value: string,
) {
  onChange({ ...meta, [field]: value });
}

export function TemplatePropertiesPanel({
  description,
  onDescriptionChange,
  catalogMeta,
  onCatalogMetaChange,
  stage,
}: TemplatePropertiesPanelProps) {
  const stageBadge = templateStageBadgeDisplay(stage);
  const [featureDraft, setFeatureDraft] = React.useState("");

  function addFeature() {
    const label = featureDraft.trim();
    if (!label) return;
    const existing = catalogMeta.keyFeatures ?? [];
    if (existing.includes(label)) {
      setFeatureDraft("");
      return;
    }
    onCatalogMetaChange({
      ...catalogMeta,
      keyFeatures: [...existing, label].slice(0, 8),
    });
    setFeatureDraft("");
  }

  function removeFeature(label: string) {
    const next = (catalogMeta.keyFeatures ?? []).filter((item) => item !== label);
    onCatalogMetaChange({
      ...catalogMeta,
      keyFeatures: next.length > 0 ? next : undefined,
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="template-subtitle">Subtitle</Label>
        <Input
          id="template-subtitle"
          value={catalogMeta.subtitle ?? ""}
          placeholder="Mobile App Development Proposal"
          onChange={(e) =>
            updateCatalogField(catalogMeta, onCatalogMetaChange, "subtitle", e.target.value)
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="template-use-case">Use case</Label>
        <Input
          id="template-use-case"
          value={catalogMeta.useCase ?? ""}
          placeholder="Mobile Development"
          onChange={(e) =>
            updateCatalogField(catalogMeta, onCatalogMetaChange, "useCase", e.target.value)
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="template-category">Category</Label>
        <Input
          id="template-category"
          value={catalogMeta.category ?? ""}
          placeholder="SaaS"
          onChange={(e) =>
            updateCatalogField(catalogMeta, onCatalogMetaChange, "category", e.target.value)
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="template-description">Description</Label>
        <Textarea
          id="template-description"
          value={description}
          rows={4}
          placeholder="Short summary shown on template cards in the hub."
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-feature-draft">Key features</Label>
        {(catalogMeta.keyFeatures?.length ?? 0) > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {catalogMeta.keyFeatures!.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1 font-normal">
                {tag}
                <button
                  type="button"
                  className="hover:bg-muted rounded-sm p-0.5"
                  aria-label={`Remove ${tag}`}
                  onClick={() => removeFeature(tag)}>
                  <X className="size-3" aria-hidden />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">No features yet.</p>
        )}
        <div className="flex gap-2">
          <Input
            id="template-feature-draft"
            value={featureDraft}
            placeholder="Dynamic Pricing"
            onChange={(e) => setFeatureDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFeature();
              }
            }}
          />
          <Button type="button" variant="outline" size="icon" aria-label="Add feature" onClick={addFeature}>
            <Plus className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="template-version">Version</Label>
        <Input
          id="template-version"
          value={catalogMeta.version ?? ""}
          placeholder="2.3"
          onChange={(e) =>
            updateCatalogField(catalogMeta, onCatalogMetaChange, "version", e.target.value)
          }
        />
      </div>

      <div className="space-y-1">
        <p className="text-muted-foreground text-xs">Status</p>
        <StatusBadge
          label={stageBadge.label}
          variant={stageBadge.variant}
          title={templateStageBadgeTitle(stage)}
        />
      </div>
    </div>
  );
}
