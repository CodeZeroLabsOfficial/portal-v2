"use client";

import Link from "next/link";
import {
  Copy,
  EllipsisVertical,
  ExternalLink,
  FilePenLine,
  Loader2,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TemplateHubRow } from "@/lib/templates/hub-rows";
import type { ProposalTemplateStage } from "@/types/proposal-template";

export interface TemplateCardActionsMenuProps {
  row: TemplateHubRow;
  disabled: boolean;
  onUpdateStage: (row: TemplateHubRow, stage: ProposalTemplateStage) => void;
  onClone: (row: TemplateHubRow) => void;
  onRequestDelete: (row: TemplateHubRow) => void;
  /** Outline trigger for cover overlay placement. */
  overlay?: boolean;
}

export function TemplateCardActionsMenu({
  row,
  disabled,
  onUpdateStage,
  onClone,
  onRequestDelete,
  overlay = false,
}: TemplateCardActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={overlay ? "outline" : "ghost"}
          size="icon"
          className={cn("size-8 shrink-0", overlay && "bg-background/80 shadow-sm backdrop-blur-sm")}
          disabled={disabled}
          aria-label={`Actions for ${row.name}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}>
          {disabled ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <EllipsisVertical className="size-4 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={row.editHref}>
            <Pencil aria-hidden />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={row.previewHref} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden />
            Preview
          </Link>
        </DropdownMenuItem>
        {row.stage === "draft" ? (
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={disabled}
            onSelect={() => void onUpdateStage(row, "published")}>
            <Send aria-hidden />
            Publish
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={disabled}
            onSelect={() => void onUpdateStage(row, "draft")}>
            <FilePenLine aria-hidden />
            Mark as draft
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="cursor-pointer"
          disabled={disabled}
          onSelect={() => void onClone(row)}>
          <Copy aria-hidden />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          disabled={disabled}
          onSelect={() => onRequestDelete(row)}>
          <Trash2 aria-hidden />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
