"use client";

import * as React from "react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { InlineEditableField } from "@/components/shared/inline-editable-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateCatalogServiceFeaturesAction } from "@/server/actions/catalog-services";
import { cn } from "@/lib/utils";

const MAX_FEATURES = 40;
const MAX_FEATURE_LENGTH = 200;

function normalizeFeatures(features: string[]): string[] {
  return features.map((feature) => feature.trim()).filter(Boolean);
}

export interface CatalogServiceFeaturesCardProps {
  serviceId: string;
  initialFeatures: string[];
  disabled?: boolean;
}

export function CatalogServiceFeaturesCard({
  serviceId,
  initialFeatures,
  disabled = false,
}: CatalogServiceFeaturesCardProps) {
  const router = useRouter();
  const [activeFieldId, setActiveFieldId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const features = React.useMemo(() => normalizeFeatures(initialFeatures), [initialFeatures]);

  async function persist(next: string[]): Promise<{ ok: boolean; message?: string }> {
    const trimmed = normalizeFeatures(next);
    if (trimmed.length > MAX_FEATURES) {
      return { ok: false, message: `At most ${MAX_FEATURES} features allowed.` };
    }
    for (const feature of trimmed) {
      if (feature.length > MAX_FEATURE_LENGTH) {
        return {
          ok: false,
          message: `Each feature must be ${MAX_FEATURE_LENGTH} characters or fewer.`,
        };
      }
    }

    setSaving(true);
    const result = await updateCatalogServiceFeaturesAction({
      serviceId,
      features: trimmed,
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.message);
      return { ok: false, message: result.message };
    }

    router.refresh();
    return { ok: true };
  }

  async function handleAddFeature() {
    if (disabled || saving || features.length >= MAX_FEATURES) return;
    const next = [...features, "New feature"];
    const result = await persist(next);
    if (result.ok) {
      setActiveFieldId(`feature-${next.length - 1}`);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Features
          {saving ? <Loader2 className="text-muted-foreground size-4 animate-spin" aria-hidden /> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {features.length > 0 ? (
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={`${index}-${feature}`} className="group/feat flex items-center gap-2">
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                >
                  <Check className="size-3.5" strokeWidth={2.5} />
                </span>
                <InlineEditableField
                  className="min-w-0 flex-1"
                  fieldId={`feature-${index}`}
                  activeFieldId={activeFieldId}
                  onActiveFieldIdChange={setActiveFieldId}
                  value={feature}
                  editLabel={`feature ${index + 1}`}
                  placeholder="Feature name"
                  emptyDisplay="Untitled feature"
                  disabled={disabled || saving}
                  onSave={async (next) => {
                    const trimmed = next.trim();
                    const updated = [...features];
                    if (!trimmed) {
                      updated.splice(index, 1);
                    } else {
                      updated[index] = trimmed;
                    }
                    return persist(updated);
                  }}
                />
                {!disabled ? (
                  <button
                    type="button"
                    disabled={saving}
                    aria-label={`Remove feature ${index + 1}`}
                    className={cn(
                      "shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity",
                      "hover:bg-destructive/10 hover:text-destructive",
                      "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "group-hover/feat:opacity-100",
                    )}
                    onClick={() => void persist(features.filter((_, featureIndex) => featureIndex !== index))}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No features yet. Add one to show on proposals.</p>
        )}

        {!disabled ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={saving || features.length >= MAX_FEATURES}
            onClick={() => void handleAddFeature()}
          >
            <Plus className="size-4" aria-hidden />
            Add feature
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
