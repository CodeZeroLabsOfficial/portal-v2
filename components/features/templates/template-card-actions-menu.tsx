"use client";

import Link from "next/link";
import { Loader2, MoreHorizontal } from "lucide-react";

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
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          disabled={disabled}
          aria-label={`Actions for ${row.name}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}>
          {disabled ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <MoreHorizontal className="size-4" aria-hidden />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={row.editHref}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={row.previewHref} target="_blank" rel="noopener noreferrer">
            Preview
          </Link>
        </DropdownMenuItem>
        {row.stage === "draft" ? (
          <DropdownMenuItem disabled={disabled} onSelect={() => void onUpdateStage(row, "published")}>
            Publish
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled={disabled} onSelect={() => void onUpdateStage(row, "draft")}>
            Mark as draft
          </DropdownMenuItem>
        )}
        <DropdownMenuItem disabled={disabled} onSelect={() => void onClone(row)}>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          disabled={disabled}
          onSelect={() => onRequestDelete(row)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
