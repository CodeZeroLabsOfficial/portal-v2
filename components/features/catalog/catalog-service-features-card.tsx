"use client";

import * as React from "react";
import { Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateCatalogServiceFeaturesAction } from "@/server/actions/catalog-services";

function normalizeFeatureRows(rows: string[]): string[] {
  return rows.map((row) => row.trim()).filter(Boolean);
}

function rowsWithTrailingEmpty(features: string[]): string[] {
  const normalized = normalizeFeatureRows(features);
  return normalized.length > 0 ? [...normalized, ""] : [""];
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
  const [rows, setRows] = React.useState(() => rowsWithTrailingEmpty(initialFeatures));
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setRows(rowsWithTrailingEmpty(initialFeatures));
  }, [initialFeatures]);

  const savedFeatures = React.useMemo(
    () => normalizeFeatureRows(initialFeatures),
    [initialFeatures],
  );
  const draftFeatures = React.useMemo(() => normalizeFeatureRows(rows), [rows]);
  const isDirty =
    draftFeatures.length !== savedFeatures.length ||
    draftFeatures.some((feature, index) => feature !== savedFeatures[index]);

  const handleRowChange = (index: number, value: string) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? value : row)));
  };

  const handleAddRow = () => {
    setRows((current) => [...current, ""]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateCatalogServiceFeaturesAction({
      serviceId,
      features: draftFeatures,
    });
    setIsSaving(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success("Features saved.");
    setRows(rowsWithTrailingEmpty(draftFeatures));
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={index} className="flex gap-2">
              <div className="grow">
                <Input
                  value={row}
                  disabled={disabled || isSaving}
                  onChange={(event) => handleRowChange(index, event.target.value)}
                  placeholder="Add a feature"
                  aria-label={`Feature ${index + 1}`}
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={disabled || isSaving}
                onClick={handleAddRow}
                aria-label="Add feature row"
              >
                <PlusCircle className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      {isDirty && !disabled ? (
        <CardFooter className="border-t">
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Save features
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
