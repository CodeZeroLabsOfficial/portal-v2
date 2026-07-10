"use client";

import { Loader2 } from "lucide-react";

import { TemplateCover } from "@/components/features/templates/template-cover";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import {
  proposalTemplatePickerExcerpt,
  type ProposalTemplatePickerRow,
} from "@/lib/templates/proposal-template-picker";

export interface ProposalTemplatePickerCardProps {
  row: ProposalTemplatePickerRow;
  isCreating?: boolean;
  disabled?: boolean;
  onUse: () => void;
}

export function ProposalTemplatePickerCard({
  row,
  isCreating = false,
  disabled = false,
  onUse,
}: ProposalTemplatePickerCardProps) {
  const excerpt = proposalTemplatePickerExcerpt(row);
  const buttonDisabled = disabled || isCreating;

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden pt-0 shadow-none transition-shadow hover:shadow-sm">
      <div className="relative">
        <TemplateCover
          alt={row.name}
          kind="proposal"
          coverPreviewBlocks={row.coverPreviewBlocks}
          branding={row.branding}
          coverImageUrl={row.coverImageUrl}
          className="aspect-[2/1] max-h-28"
        />
      </div>

      <CardContent className="flex flex-1 flex-col gap-2 p-3">
        <h4 className="line-clamp-2 text-base leading-snug font-semibold">{row.name}</h4>

        <Typography variant="muted" className="line-clamp-2 text-sm">
          {excerpt}
        </Typography>

        <div className="mt-auto pt-1">
          <Button
            type="button"
            className="w-full"
            size="sm"
            disabled={buttonDisabled}
            aria-busy={isCreating}
            onClick={onUse}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Creating…
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
