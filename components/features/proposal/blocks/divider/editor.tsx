"use client";

import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import type { DividerBlock } from "@/types/proposal";
import { Separator } from "@/components/ui/separator";

/** Divider blocks have no editable fields — canvas shows the rule. */
export function DividerBlockEditor(_props: BlockEditorProps<DividerBlock>) {
  return <Separator className="my-2" />;
}
