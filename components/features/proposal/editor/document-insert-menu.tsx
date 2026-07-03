"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { useBlockMenuProfile } from "@/components/features/proposal/editor/proposal-block-fields";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createProposalBlock } from "@/lib/proposal/block-definitions";
import {
  documentPrimaryOptions,
  libraryBlockOptions,
  type BlockInsertOption,
} from "@/lib/proposal/block-insert-menu";
import { PROPOSAL_EDITOR_INSERT_ROW_OVERLAP_CLASSES } from "@/lib/proposal/public/public-layout";
import { cn } from "@/lib/utils";
import type { ProposalBlock } from "@/types/proposal";

type BlockOption = BlockInsertOption;

/**
 * Insert popover triggered by the round "+" button between blocks.
 * Shows a 3×2 grid of primary block tiles and reveals a secondary library list
 * via "Add block from library".
 */
export function AddBlockMenu({
  onAdd,
  trigger,
  align = "center",
}: {
  onAdd: (block: ProposalBlock) => void;
  trigger: React.ReactNode;
  align?: "start" | "center" | "end";
}) {
  const blockMenuProfile = useBlockMenuProfile();
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<"main" | "library">("main");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      window.setTimeout(() => setView("main"), 150);
    }
  }

  function handlePick(option: BlockOption) {
    onAdd(option.factory?.() ?? createProposalBlock(option.type));
    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={8}
        className="w-[320px] p-0"
        onCloseAutoFocus={(event: Event) => event.preventDefault()}
      >
        {view === "main" ? (
          <div className="p-3">
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Add a block
            </p>
            <div className="grid grid-cols-3 gap-2">
              {documentPrimaryOptions(blockMenuProfile).map((opt) => (
                <BlockTile key={opt.id} option={opt} onSelect={() => handlePick(opt)} />
              ))}
            </div>
            {libraryBlockOptions(blockMenuProfile).length > 0 ? (
              <button
                type="button"
                onClick={() => setView("library")}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border-t border-border/60 px-2 py-2 pt-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Add block from library
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        ) : (
          <div className="p-2">
            <button
              type="button"
              onClick={() => setView("main")}
              className="mb-1 flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </button>
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Content
            </p>
            <div className="space-y-0.5">
              {libraryBlockOptions(blockMenuProfile).map((opt) => (
                <LibraryRow key={opt.id} option={opt} onSelect={() => handlePick(opt)} />
              ))}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BlockTile({ option, onSelect }: { option: BlockOption; onSelect: () => void }) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex flex-col items-center justify-center gap-1.5 rounded-lg border border-transparent bg-muted/40 px-2 py-3 text-xs font-medium text-foreground transition-all hover:border-border hover:bg-accent hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-transform group-hover:scale-105",
          option.accentBg,
        )}
      >
        <Icon className={cn("h-4 w-4", option.accent)} />
      </span>
      <span className="text-xs uppercase tracking-wide">{option.label}</span>
    </button>
  );
}

function LibraryRow({ option, onSelect }: { option: BlockOption; onSelect: () => void }) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent focus:outline-none focus-visible:bg-accent"
    >
      <span className={cn("flex h-6 w-6 items-center justify-center rounded", option.accentBg)}>
        <Icon className={cn("h-3.5 w-3.5", option.accent)} />
      </span>
      {option.label}
    </button>
  );
}

/**
 * Full-width insert seam between blocks (Qwilr-style): zero layout gap between
 * stacked section bands; hovering the row highlights it and reveals the "+" control.
 */
export function InsertBlockSlot({
  onAdd,
  variant = "between",
}: {
  onAdd: (block: ProposalBlock) => void;
  variant?: "between" | "empty";
}) {
  const blockMenuProfile = useBlockMenuProfile();
  if (variant === "empty") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-12 text-center">
        <p className="text-sm font-medium text-foreground">
          {blockMenuProfile === "contract-template" ? "Start building your contract" : "Start building your proposal"}
        </p>
        <p className="max-w-xs text-xs text-muted-foreground">
          {blockMenuProfile === "contract-template"
            ? "Add sections, headings, and rich text for the buyer agreement modal — content before the first section becomes the intro."
            : "Add a grouped layout, text blocks, headings, visuals, quoting tables, accepting signatures, plus everything in your block library — then refine with the contextual toolbar."}
        </p>
        <AddBlockMenu
          onAdd={onAdd}
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/60 hover:bg-primary hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Add a block"
            >
              <Plus className="h-4 w-4" /> Add block
            </button>
          }
        />
      </div>
    );
  }
  const plusIconClasses =
    "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover/insert:opacity-100 group-focus-visible/insert:opacity-100 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:opacity-100 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-primary data-[state=open]:bg-primary data-[state=open]:text-primary-foreground data-[state=open]:opacity-100";

  const insertRowTrigger = (
    <button
      type="button"
      aria-label="Add block here"
      className={cn(
        "group/insert absolute inset-x-0 top-1/2 z-20 flex h-7 -translate-y-1/2 items-center justify-center border-0 p-0",
        "bg-transparent transition-colors hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        "data-[state=open]:bg-primary/10",
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-primary/50 opacity-0 transition-opacity group-hover/insert:opacity-100 group-focus-visible/insert:opacity-100 group-data-[state=open]/insert:opacity-100"
      />
      <span className={plusIconClasses}>
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </span>
    </button>
  );

  return (
    <div className={cn("relative z-20 h-0 w-full", PROPOSAL_EDITOR_INSERT_ROW_OVERLAP_CLASSES)}>
      <AddBlockMenu onAdd={onAdd} trigger={insertRowTrigger} />
    </div>
  );
}
