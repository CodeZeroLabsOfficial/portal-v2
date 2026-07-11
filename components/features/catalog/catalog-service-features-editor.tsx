"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const CATALOG_MAX_FEATURES = 40;
export const CATALOG_MAX_FEATURE_LENGTH = 200;

export function normalizeCatalogFeatures(features: string[]): string[] {
  return features.map((feature) => feature.trim()).filter(Boolean);
}

export interface CatalogServiceFeaturesEditorProps {
  features: string[];
  onChange: (features: string[]) => void;
  disabled?: boolean;
}

export function CatalogServiceFeaturesEditor({
  features,
  onChange,
  disabled = false,
}: CatalogServiceFeaturesEditorProps) {
  function handleAdd() {
    if (disabled || features.length >= CATALOG_MAX_FEATURES) return;
    onChange([...features, ""]);
  }

  function handleUpdate(index: number, value: string) {
    const next = [...features];
    next[index] = value.slice(0, CATALOG_MAX_FEATURE_LENGTH);
    onChange(next);
  }

  function handleRemove(index: number) {
    onChange(features.filter((_, featureIndex) => featureIndex !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          Features shown on proposals for this plan.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || features.length >= CATALOG_MAX_FEATURES}
          onClick={handleAdd}
        >
          <Plus />
          Add feature
        </Button>
      </div>

      {features.length > 0 ? (
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Input
                value={feature}
                disabled={disabled}
                placeholder="Feature name"
                maxLength={CATALOG_MAX_FEATURE_LENGTH}
                aria-label={`Feature ${index + 1}`}
                onChange={(event) => handleUpdate(index, event.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                aria-label={`Remove feature ${index + 1}`}
                onClick={() => handleRemove(index)}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">No features yet. Add one to show on proposals.</p>
      )}
    </div>
  );
}
