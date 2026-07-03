"use client";

import * as React from "react";
import { Check, Pencil } from "lucide-react";

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

interface SectionOutlineRowProps {
  block: SectionBlock;
  index: number;
  editing: boolean;
  draftTitle: string;
  onDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function SectionOutlineRow({
  block,
  index,
  editing,
  draftTitle,
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
      <div className="flex min-w-0 flex-1 items-center gap-1">
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
          className="h-7 min-w-0 flex-1 px-2 text-sm"
        />
        <Button
          type="button"
          size="icon-sm"
          className="size-7 shrink-0"
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
    <button
      type="button"
      aria-label={`Rename section: ${displayLabel}`}
      onClick={onStartEdit}
      className={cn(
        "group/section-outline inline-flex min-w-0 flex-1 items-center gap-1.5 rounded-sm text-left",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <span className="text-foreground min-w-0 truncate font-medium">{displayLabel}</span>
      <Pencil
        className="text-muted-foreground size-3.5 shrink-0 opacity-0 transition-opacity group-hover/section-outline:opacity-100 group-focus-visible/section-outline:opacity-100"
        aria-hidden
      />
    </button>
  );
}

export function BlockOutlinePanel() {
  const { document, updateBlock } = useDocumentEditor();
  const blocks = document.blocks;
  const [editingSectionId, setEditingSectionId] = React.useState<string | null>(null);
  const [draftTitle, setDraftTitle] = React.useState("");

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
      {blocks.map((block, index) => (
        <li
          key={block.id}
          className="text-muted-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <span className="text-foreground/70 tabular-nums">{index + 1}.</span>
          {block.type === "section" ? (
            <SectionOutlineRow
              block={block}
              index={index}
              editing={editingSectionId === block.id}
              draftTitle={draftTitle}
              onDraftChange={setDraftTitle}
              onStartEdit={() => startEditSection(block)}
              onConfirm={() => confirmEdit(block)}
              onCancel={cancelEdit}
            />
          ) : (
            <span className="text-foreground font-medium">{blockOutlineLabel(block, index)}</span>
          )}
        </li>
      ))}
    </ol>
  );
}
