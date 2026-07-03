"use client";

import type { ProposalBlock } from "@/types/proposal";
import { Typography } from "@/components/ui/typography";

function blockOutlineLabel(block: ProposalBlock): string {
  switch (block.type) {
    case "header":
      return "Heading";
    case "text":
      return "Text";
    case "splash":
      return "Splash";
    case "section":
      return `Section (${block.children.length})`;
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

export interface BlockOutlinePanelProps {
  blocks: ProposalBlock[];
}

export function BlockOutlinePanel({ blocks }: BlockOutlinePanelProps) {
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
          <span className="text-foreground font-medium">{blockOutlineLabel(block)}</span>
        </li>
      ))}
    </ol>
  );
}
