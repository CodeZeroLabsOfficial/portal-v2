"use client";

import { PricingInlineEditor } from "@/components/features/proposal/blocks/commerce-inline-editors";
import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import type { PricingBlock } from "@/types/proposal";

export function PricingBlockEditor({ block, onChange }: BlockEditorProps<PricingBlock>) {
  return <PricingInlineEditor block={block} onChange={onChange} />;
}
