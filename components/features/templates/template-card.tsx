"use client";

import Link from "next/link";

import { TemplateCardActionsMenu } from "@/components/features/templates/template-card-actions-menu";
import { TemplateCover } from "@/components/features/templates/template-cover";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { formatLastEditedInLocality } from "@/lib/proposal/public/locality-dates";
import type { TemplateHubRow } from "@/lib/templates/hub-rows";
import {
  templateKindLabel,
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
  const { cardMeta } = row;

  return (
    <Card className="group flex h-full w-full flex-col overflow-hidden pt-0 shadow-none transition-shadow hover:shadow-md">
      <div className="relative">
        <Link href={row.editHref} className="block">
          <TemplateCover coverImageUrl={row.coverImageUrl} alt={row.name} kind={row.kind} />
        </Link>

        <Badge
          variant="outline"
          className="absolute top-3 left-3 z-10 bg-card shadow-sm">
          {templateKindLabel(row.kind)}
        </Badge>

        <div className="absolute top-3 right-3 z-10">
          <TemplateCardActionsMenu
            row={row}
            disabled={disabled}
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

        {cardMeta.subtitleLabel ? (
          <Typography variant="muted" className="line-clamp-2 text-sm">
            {cardMeta.subtitleLabel}
          </Typography>
        ) : null}

        {cardMeta.taxonomyLabel ? (
          <Typography variant="muted" className="line-clamp-2 text-sm">
            {cardMeta.taxonomyLabel}
          </Typography>
        ) : null}

        <Typography variant="muted" className="line-clamp-3 text-sm">
          {templateExcerpt(row)}
        </Typography>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Author</p>
            <div className="flex items-center gap-2">
              <Avatar className="size-6 shrink-0" title={cardMeta.authorName}>
                {cardMeta.authorPhotoUrl ? (
                  <AvatarImage src={cardMeta.authorPhotoUrl} alt="" />
                ) : null}
                <AvatarFallback className="text-[10px] font-semibold">
                  {cardMeta.authorInitials}
                </AvatarFallback>
              </Avatar>
              <p className="truncate font-medium leading-none">{cardMeta.authorName}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Updated</p>
            <p className="font-medium">
              <time
                dateTime={
                  row.lastEditedMs > 0 ? new Date(row.lastEditedMs).toISOString() : undefined
                }>
                {formatLastEditedInLocality(row.lastEditedMs, localityTimeZone)}
              </time>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Length</p>
            <p className="font-medium">{cardMeta.lengthLabel ?? "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Usage</p>
            <p className="font-medium">{cardMeta.usageLabel}</p>
          </div>
        </div>

        {cardMeta.featureTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {cardMeta.featureTags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
