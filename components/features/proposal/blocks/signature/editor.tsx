"use client";

import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SignatureBlock } from "@/types/proposal";

export function SignatureBlockEditor({ block, onChange }: BlockEditorProps<SignatureBlock>) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input value={block.title ?? ""} onChange={(e) => onChange({ ...block, title: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Signatory label</Label>
        <Input
          value={block.signerLabel ?? ""}
          onChange={(e) => onChange({ ...block, signerLabel: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Terms summary</Label>
        <textarea
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={block.termsSummary ?? ""}
          onChange={(e) => onChange({ ...block, termsSummary: e.target.value })}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(block.requirePrintedName)}
          onChange={(e) => onChange({ ...block, requirePrintedName: e.target.checked })}
        />
        Require printed name on acceptance
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(block.requireAcceptTerms)}
          onChange={(e) => onChange({ ...block, requireAcceptTerms: e.target.checked })}
        />
        Require terms acknowledgment
      </label>
    </div>
  );
}
