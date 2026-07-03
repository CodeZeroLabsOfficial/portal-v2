"use client";

import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProposalBlock } from "@/types/proposal";

type PaymentBlock = Extract<ProposalBlock, { type: "payment" }>;

export function PaymentBlockEditor({ block, onChange }: BlockEditorProps<PaymentBlock>) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Label</Label>
        <Input
          value={block.label ?? ""}
          onChange={(e) => onChange({ ...block, label: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Stripe price ID (optional)</Label>
        <Input
          value={block.stripePriceId ?? ""}
          onChange={(e) => onChange({ ...block, stripePriceId: e.target.value || undefined })}
          placeholder="price_…"
        />
      </div>
    </div>
  );
}
