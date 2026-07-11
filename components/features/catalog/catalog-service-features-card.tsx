import { Check } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function normalizeFeatures(features: string[]): string[] {
  return features.map((feature) => feature.trim()).filter(Boolean);
}

export interface CatalogServiceFeaturesCardProps {
  features: string[];
}

export function CatalogServiceFeaturesCard({ features }: CatalogServiceFeaturesCardProps) {
  const items = normalizeFeatures(features);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Features</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((feature, index) => (
              <li key={`${index}-${feature}`} className="flex items-center gap-2">
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                >
                  <Check className="size-3.5" strokeWidth={2.5} />
                </span>
                <span className="min-w-0 flex-1 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No features yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
