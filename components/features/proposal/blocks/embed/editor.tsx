"use client";

import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProposalBlock } from "@/types/proposal";

type EmbedBlock = Extract<ProposalBlock, { type: "embed" }>;

export function EmbedBlockEditor({ block, onChange }: BlockEditorProps<EmbedBlock>) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Embed URL</Label>
        <Input value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input
          value={block.title ?? ""}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
        />
      </div>
    </div>
  );
}
