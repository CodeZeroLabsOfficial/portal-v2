"use client";

import * as React from "react";
import { Check, Pencil } from "lucide-react";

import { useBuilderCanvasNavigation } from "@/components/features/proposal/editor/builder-canvas-navigation";
import { useDocumentEditor } from "@/components/features/proposal/editor/document-editor-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { sectionOutlineLabel } from "@/lib/proposal/outline-labels";
import { cn } from "@/lib/utils";
import type { ProposalBlock, SectionBlock } from "@/types/proposal";

function blockOutlineLabel(block: ProposalBlock, outlineIndex: number): string {
  switch (block.type) {
    case "header":
      return "Heading";
    case "text":
      return "Text";
    case "splash":
      return "Splash";
    case "section":
      return sectionOutlineLabel(block, outlineIndex);
    case "columns":
      return `Columns (${block.stacks.length})`;
    case "packages":
      return "Plans";
    case "pricing":
      return "Pricing";
    case "agreement":
      return "Accept";
    case "image":
      return "Image";
    case "video":
      return "Video";
    case "icon":
      return "Icon";
    case "accordion":
      return "Accordion";
    case "form":
      return "Form";
    case "signature":
      return "Signature";
    case "payment":
      return "Payment";
    case "embed":
      return "Embed";
    case "divider":
      return "Divider";
    case "spacer":
      return "Spacer";
    default:
      return "Block";
  }
}

function outlineNavButtonClasses(selected: boolean): string {
  return cn(
    "text-foreground min-w-0 flex-1 truncate rounded-sm px-1.5 py-0.5 text-left text-sm font-medium transition-colors",
    "hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    selected && "bg-muted",
  );
}

interface OutlineNavButtonProps {
  label: string;
  selected: boolean;
  onNavigate: () => void;
}

function OutlineNavButton({ label, selected, onNavigate }: OutlineNavButtonProps) {
  return (
    <button
      type="button"
      aria-label={`Go to ${label}`}
      aria-current={selected ? "true" : undefined}
      onClick={onNavigate}
      className={outlineNavButtonClasses(selected)}
    >
      {label}
    </button>
  );
}

interface SectionOutlineRowProps {
  block: SectionBlock;
  index: number;
  selected: boolean;
  editing: boolean;
  draftTitle: string;
  onNavigate: () => void;
  onDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function SectionOutlineRow({
  block,
  index,
  selected,
  editing,
  draftTitle,
  onNavigate,
  onDraftChange,
  onStartEdit,
  onConfirm,
  onCancel,
}: SectionOutlineRowProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const displayLabel = sectionOutlineLabel(block, index);

  React.useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  if (editing) {
    return (
      <div className="relative min-w-0 flex-1">
        <Input
          ref={inputRef}
          aria-label="Section name"
          value={draftTitle}
          placeholder={displayLabel}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onConfirm();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
          className="h-7 w-full min-w-0 px-2 pr-9 text-sm"
        />
        <Button
          type="button"
          size="icon-sm"
          className="absolute right-0 top-1/2 size-7 -translate-y-1/2 shrink-0"
          aria-label="Save section name"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onConfirm}
        >
          <Check className="size-3.5" aria-hidden />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 flex-1">
      <OutlineNavButton label={displayLabel} selected={selected} onNavigate={onNavigate} />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground absolute right-0 top-1/2 size-7 -translate-y-1/2 shrink-0 opacity-0 transition-opacity group-hover/outline-row:opacity-100 focus-visible:opacity-100"
        aria-label={`Rename section: ${displayLabel}`}
        onClick={(e) => {
          e.stopPropagation();
          onStartEdit();
        }}
      >
        <Pencil className="size-3.5" aria-hidden />
      </Button>
    </div>
  );
}

export function BlockOutlinePanel() {
  const { document, updateBlock } = useDocumentEditor();
  const navigation = useBuilderCanvasNavigation();
  const blocks = document.blocks;
  const [editingSectionId, setEditingSectionId] = React.useState<string | null>(null);
  const [draftTitle, setDraftTitle] = React.useState("");

  function navigateToBlock(blockId: string) {
    navigation?.navigateToBlock(blockId);
  }

  function startEditSection(block: SectionBlock) {
    setEditingSectionId(block.id);
    setDraftTitle(block.title ?? "");
  }

  function cancelEdit() {
    setEditingSectionId(null);
    setDraftTitle("");
  }

  function confirmEdit(block: SectionBlock) {
    const trimmed = draftTitle.trim();
    const next: SectionBlock = { ...block };
    if (trimmed) next.title = trimmed;
    else delete next.title;
    updateBlock(block.id, next);
    cancelEdit();
  }

  if (blocks.length === 0) {
    return (
      <Typography variant="muted" className="text-sm">
        No blocks yet. Add blocks from the canvas.
      </Typography>
    );
  }

  return (
    <ol className="space-y-1">
      {blocks.map((block, index) => {
        const selected = navigation?.selectedBlockId === block.id;
        const label = blockOutlineLabel(block, index);

        return (
          <li
            key={block.id}
            className="group/outline-row text-muted-foreground relative flex items-center gap-2 rounded-md px-2 py-1.5 pr-8 text-sm"
          >
            <span className="text-foreground/70 tabular-nums">{index + 1}.</span>
            {block.type === "section" ? (
              <SectionOutlineRow
                block={block}
                index={index}
                selected={selected}
                editing={editingSectionId === block.id}
                draftTitle={draftTitle}
                onNavigate={() => navigateToBlock(block.id)}
                onDraftChange={setDraftTitle}
                onStartEdit={() => startEditSection(block)}
                onConfirm={() => confirmEdit(block)}
                onCancel={cancelEdit}
              />
            ) : (
              <OutlineNavButton
                label={label}
                selected={selected}
                onNavigate={() => navigateToBlock(block.id)}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
