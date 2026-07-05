"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

import { TemplateCardActionsMenu } from "@/components/features/templates/template-card-actions-menu";
import { TemplateCover } from "@/components/features/templates/template-cover";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { formatLastEditedInLocality } from "@/lib/proposal/public/locality-dates";
import type { TemplateHubRow } from "@/lib/templates/hub-rows";
import {
  templateStageBadgeDisplay,
  templateStageBadgeTitle,
} from "@/lib/templates/status-badges";
import type { ProposalTemplateStage } from "@/types/proposal-template";

export interface TemplateCardProps {
  row: TemplateHubRow;
  localityTimeZone?: string;
  disabled: boolean;
  onUpdateStage: (row: TemplateHubRow, stage: ProposalTemplateStage) => void;
  onClone: (row: TemplateHubRow) => void;
  onRequestDelete: (row: TemplateHubRow) => void;
}

function templateExcerpt(row: TemplateHubRow): string {
  return row.description?.trim() || row.agreementTitle?.trim() || "No description";
}

export function TemplateCard({
  row,
  localityTimeZone,
  disabled,
  onUpdateStage,
  onClone,
  onRequestDelete,
}: TemplateCardProps) {
  const stageBadge = templateStageBadgeDisplay(row.stage);
  const editLabel = row.kind === "contract" ? "Edit contract" : "Edit template";

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden pt-0 shadow-none transition-shadow hover:shadow-md">
      <Link href={row.editHref} className="block">
        <TemplateCover coverImageUrl={row.coverImageUrl} alt={row.name} kind={row.kind} />
      </Link>

      <CardContent className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between gap-2">
          <StatusBadge
            label={stageBadge.label}
            variant={stageBadge.variant}
            title={templateStageBadgeTitle(row.stage)}
          />
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground flex items-center text-xs">
              <Clock className="me-1 size-3" aria-hidden />
              <time
                dateTime={
                  row.lastEditedMs > 0 ? new Date(row.lastEditedMs).toISOString() : undefined
                }>
                {formatLastEditedInLocality(row.lastEditedMs, localityTimeZone)}
              </time>
            </span>
            <TemplateCardActionsMenu
              row={row}
              disabled={disabled}
              onUpdateStage={onUpdateStage}
              onClone={onClone}
              onRequestDelete={onRequestDelete}
            />
          </div>
        </div>

        <Link href={row.editHref} className="hover:underline">
          <Typography variant="h3" className="line-clamp-2">
            {row.name}
          </Typography>
        </Link>

        <Typography variant="muted" className="line-clamp-3">
          {templateExcerpt(row)}
        </Typography>

        <Button variant="outline" size="sm" className="mt-auto w-full" asChild>
          <Link href={row.editHref}>{editLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
