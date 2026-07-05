"use client";

import Link from "next/link";
import { Copy, EllipsisVertical, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TemplateHubRow } from "@/lib/templates/hub-rows";
import type { ProposalTemplateStage } from "@/types/proposal-template";

export interface TemplateCardActionsMenuProps {
  row: TemplateHubRow;
  disabled: boolean;
  onUpdateStage: (row: TemplateHubRow, stage: ProposalTemplateStage) => void;
  onClone: (row: TemplateHubRow) => void;
  onRequestDelete: (row: TemplateHubRow) => void;
}

export function TemplateCardActionsMenu({
  row,
  disabled,
  onUpdateStage,
  onClone,
  onRequestDelete,
}: TemplateCardActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          disabled={disabled}
          aria-label={`Actions for ${row.name}`}>
          {disabled ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <EllipsisVertical className="size-4 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={row.editHref}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={row.previewHref} target="_blank" rel="noopener noreferrer">
            Preview
          </Link>
        </DropdownMenuItem>
        {row.stage === "draft" ? (
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={disabled}
            onSelect={() => void onUpdateStage(row, "published")}>
            Publish
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={disabled}
            onSelect={() => void onUpdateStage(row, "draft")}>
            Mark as draft
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="cursor-pointer"
          disabled={disabled}
          onSelect={() => void onClone(row)}>
          <Copy />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          disabled={disabled}
          onSelect={() => onRequestDelete(row)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
