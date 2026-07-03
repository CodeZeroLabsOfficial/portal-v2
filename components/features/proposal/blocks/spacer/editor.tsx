"use client";

import { SpacerBlockHeightEditor } from "@/components/features/proposal/blocks/spacer/spacer-height-editor";
import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import type { SpacerBlock } from "@/types/proposal";

export function SpacerBlockEditor({ block, onChange }: BlockEditorProps<SpacerBlock>) {
  return <SpacerBlockHeightEditor block={block} onChange={onChange} />;
}
