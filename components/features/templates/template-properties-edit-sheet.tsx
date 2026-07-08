"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import {
  sheetContentClass,
  sheetFormClass,
} from "@/components/shared/sheet-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  catalogSelectOptions,
  type TemplateCatalogMeta,
} from "@/lib/templates/catalog-meta";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_CLASSIFICATIONS,
} from "@/lib/templates/template-catalog-options";

export interface TemplatePropertiesEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  catalogMeta: TemplateCatalogMeta;
  /** Contract templates — customer-facing agreement modal / PDF title. */
  agreementTitle?: string;
  onSave: (description: string, catalogMeta: TemplateCatalogMeta, agreementTitle?: string) => void;
}

function updateCatalogField(
  meta: TemplateCatalogMeta,
  field: keyof TemplateCatalogMeta,
  value: string,
): TemplateCatalogMeta {
  return { ...meta, [field]: value };
}

export function TemplatePropertiesEditSheet({
  open,
  onOpenChange,
  description,
  catalogMeta,
  agreementTitle,
  onSave,
}: TemplatePropertiesEditSheetProps) {
  const isContractTemplate = agreementTitle !== undefined;
  const [draftDescription, setDraftDescription] = React.useState(description);
  const [draftCatalogMeta, setDraftCatalogMeta] = React.useState(catalogMeta);
  const [draftAgreementTitle, setDraftAgreementTitle] = React.useState(agreementTitle ?? "");
  const [featureDraft, setFeatureDraft] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setDraftDescription(description);
    setDraftCatalogMeta(catalogMeta);
    setDraftAgreementTitle(agreementTitle ?? "");
    setFeatureDraft("");
  }, [open, description, catalogMeta, agreementTitle]);

  const classificationOptions = catalogSelectOptions(
    TEMPLATE_CLASSIFICATIONS,
    draftCatalogMeta.classification,
  );
  const categoryOptions = catalogSelectOptions(TEMPLATE_CATEGORIES, draftCatalogMeta.category);

  function addFeature() {
    const label = featureDraft.trim();
    if (!label) return;
    const existing = draftCatalogMeta.keyFeatures ?? [];
    if (existing.includes(label)) {
      setFeatureDraft("");
      return;
    }
    setDraftCatalogMeta({
      ...draftCatalogMeta,
      keyFeatures: [...existing, label].slice(0, 8),
    });
    setFeatureDraft("");
  }

  function removeFeature(label: string) {
    const next = (draftCatalogMeta.keyFeatures ?? []).filter((item) => item !== label);
    setDraftCatalogMeta({
      ...draftCatalogMeta,
      keyFeatures: next.length > 0 ? next : undefined,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(
      draftDescription,
      draftCatalogMeta,
      isContractTemplate ? draftAgreementTitle.trim() || "Services Agreement" : undefined,
    );
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={sheetContentClass}>
        <SheetHeader>
          <SheetTitle>Edit properties</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className={sheetFormClass} noValidate>
          {isContractTemplate ? (
            <div className="space-y-1.5">
              <Label htmlFor="template-agreement-title">Agreement title</Label>
              <Input
                id="template-agreement-title"
                value={draftAgreementTitle}
                placeholder="Services Agreement"
                onChange={(e) => setDraftAgreementTitle(e.target.value)}
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="template-subtitle">Subtitle</Label>
            <Input
              id="template-subtitle"
              value={draftCatalogMeta.subtitle ?? ""}
              placeholder="Mobile App Development Proposal"
              onChange={(e) =>
                setDraftCatalogMeta(updateCatalogField(draftCatalogMeta, "subtitle", e.target.value))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={draftDescription}
              rows={4}
              placeholder="Short summary shown on template cards in the hub."
              onChange={(e) => setDraftDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-version">Version</Label>
            <Input
              id="template-version"
              value={draftCatalogMeta.version ?? ""}
              placeholder="2.3"
              onChange={(e) =>
                setDraftCatalogMeta(updateCatalogField(draftCatalogMeta, "version", e.target.value))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-classification">Classification</Label>
            <Select
              value={draftCatalogMeta.classification || undefined}
              onValueChange={(value) =>
                setDraftCatalogMeta(updateCatalogField(draftCatalogMeta, "classification", value))
              }>
              <SelectTrigger id="template-classification" className="w-full">
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
              <SelectContent>
                {classificationOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-category">Category</Label>
            <Select
              value={draftCatalogMeta.category || undefined}
              onValueChange={(value) =>
                setDraftCatalogMeta(updateCatalogField(draftCatalogMeta, "category", value))
              }>
              <SelectTrigger id="template-category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-feature-draft">Key features</Label>
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
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Add feature"
                onClick={addFeature}>
                <Plus className="size-4" aria-hidden />
              </Button>
            </div>
            {(draftCatalogMeta.keyFeatures?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {draftCatalogMeta.keyFeatures!.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
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
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
