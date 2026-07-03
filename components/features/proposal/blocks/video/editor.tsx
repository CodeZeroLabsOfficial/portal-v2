"use client";

import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VideoBlock } from "@/types/proposal";

export function VideoBlockEditor({ block, onChange }: BlockEditorProps<VideoBlock>) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Video URL (YouTube or Vimeo)</Label>
        <Input
          value={block.url}
          onChange={(e) => onChange({ ...block, url: e.target.value })}
          placeholder="https://…"
        />
      </div>
    </div>
  );
}
