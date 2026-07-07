"use client";

import { Loader2 } from "lucide-react";

import { TemplateCover } from "@/components/features/templates/template-cover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { contractTemplatePickerExcerpt } from "@/lib/templates/contract-template-picker";
import type { ContractTemplatePickerRow } from "@/lib/templates/contract-template-picker";
import { templateKindLabel } from "@/lib/templates/status-badges";
import { cn } from "@/lib/utils";

export interface ContractTemplatePickerCardProps {
  row: ContractTemplatePickerRow;
  isSelected?: boolean;
  isApplying?: boolean;
  disabled?: boolean;
  onUse: () => void;
}

export function ContractTemplatePickerCard({
  row,
  isSelected = false,
  isApplying = false,
  disabled = false,
  onUse,
}: ContractTemplatePickerCardProps) {
  const excerpt = contractTemplatePickerExcerpt(row);
  const buttonDisabled = disabled || isApplying;

  return (
    <Card
      className={cn(
        "flex h-full w-full flex-col overflow-hidden pt-0 shadow-none transition-shadow hover:shadow-md",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <div className="relative">
        <TemplateCover coverImageUrl={row.coverImageUrl} alt={row.name} kind="contract" />
        <Badge variant="outline" className="absolute top-3 left-3 z-10 bg-card shadow-sm">
          {templateKindLabel("contract")}
        </Badge>
        {row.stage === "draft" ? (
          <Badge variant="secondary" className="absolute top-3 right-3 z-10 bg-card shadow-sm">
            Draft
          </Badge>
        ) : null}
      </div>

      <CardContent className="flex flex-1 flex-col space-y-4">
        <div className="space-y-1">
          <h4 className="line-clamp-2 text-xl leading-snug">{row.name}</h4>
          {row.cardMeta.subtitleLabel ? (
            <Typography variant="muted" className="line-clamp-2 text-sm">
              {row.cardMeta.subtitleLabel}
            </Typography>
          ) : null}
        </div>

        <Typography variant="muted" className="line-clamp-3 text-sm">
          {excerpt}
        </Typography>

        {row.cardMeta.featureTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {row.cardMeta.featureTags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-auto pt-2">
          <Button
            type="button"
            className="w-full"
            size="sm"
            disabled={buttonDisabled}
            aria-busy={isApplying}
            onClick={onUse}
          >
            {isApplying ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Applying…
              </>
            ) : (
              "Use Template"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
