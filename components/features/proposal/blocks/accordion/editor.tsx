"use client";

import { AccordionBlockEditor as AccordionBlockEditorSurface } from "@/components/proposal/accordion-block-editor";
import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import type { AccordionBlock } from "@/types/proposal";

export function AccordionBlockEditor({ block, onChange }: BlockEditorProps<AccordionBlock>) {
  return <AccordionBlockEditorSurface block={block} onChange={onChange} />;
}
