"use client";

import { SplashBlockInspector } from "@/components/proposal/proposal-splash-editor";
import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import type { SplashBlock } from "@/types/proposal";

export function SplashBlockEditor({ block, onChange }: BlockEditorProps<SplashBlock>) {
  return <SplashBlockInspector block={block} onChange={onChange} />;
}
