"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

import { TemplateCardActionsMenu } from "@/components/features/templates/template-card-actions-menu";
import { TemplateCover } from "@/components/features/templates/template-cover";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { formatLastEditedInLocality } from "@/lib/proposal/public/locality-dates";
import type { TemplateHubRow } from "@/lib/templates/hub-rows";
import {
  templateKindBadgeDisplay,
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
  const kindBadge = templateKindBadgeDisplay(row.kind);
  const stageBadge = templateStageBadgeDisplay(row.stage);
  const { cardMeta } = row;

  return (
    <Card className="group flex h-full w-full flex-col overflow-hidden pt-0 shadow-none transition-shadow hover:shadow-md">
      <div className="relative">
        <Link href={row.editHref} className="block">
          <TemplateCover coverImageUrl={row.coverImageUrl} alt={row.name} kind={row.kind} />
        </Link>

        <Badge variant="secondary" className="absolute top-3 left-3 z-10 shadow-sm">
          {kindBadge.label}
        </Badge>

        <div
          className="absolute top-3 right-3 z-10"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}>
          <TemplateCardActionsMenu
            row={row}
            disabled={disabled}
            overlay
            onUpdateStage={onUpdateStage}
            onClone={onClone}
            onRequestDelete={onRequestDelete}
          />
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={row.editHref} className="min-w-0 hover:underline">
            <Typography variant="h3" className="line-clamp-2">
              {row.name}
            </Typography>
          </Link>
          <StatusBadge
            label={stageBadge.label}
            variant={stageBadge.variant}
            title={templateStageBadgeTitle(row.stage)}
            className="shrink-0"
          />
        </div>

        <Typography variant="muted" className="line-clamp-3 text-sm">
          {templateExcerpt(row)}
        </Typography>

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="size-6 shrink-0">
              <AvatarFallback className="text-[10px] font-semibold">
                {cardMeta.authorInitials}
              </AvatarFallback>
            </Avatar>
            <p className="truncate font-medium leading-none">{cardMeta.authorName}</p>
          </div>
          <span className="text-muted-foreground flex shrink-0 items-center text-xs">
            <Clock className="me-1 size-3" aria-hidden />
            <time
              dateTime={
                row.lastEditedMs > 0 ? new Date(row.lastEditedMs).toISOString() : undefined
              }>
              {formatLastEditedInLocality(row.lastEditedMs, localityTimeZone)}
            </time>
          </span>
        </div>

        <div className="text-muted-foreground flex items-center justify-between gap-3 text-sm">
          <span>{cardMeta.lengthLabel ?? "—"}</span>
          <span className="text-foreground shrink-0 font-medium">{cardMeta.usageLabel}</span>
        </div>

        {cardMeta.featureTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {cardMeta.featureTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
