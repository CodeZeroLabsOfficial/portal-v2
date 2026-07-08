"use client";

import { PackagesInlineEditor } from "@/components/proposal/proposal-block-inline-editors";
import { ProposalSectionShell } from "@/components/proposal/proposal-section-shell";
import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import { PROPOSAL_EDITOR_SECTION_INNER_PAD_CLASSES } from "@/lib/proposal/public/public-layout";
import { resolveSectionBackground } from "@/lib/proposal/section-background";
import { cn } from "@/lib/utils";
import type { PackagesBlock } from "@/types/proposal";

export function PackagesBlockEditor({ block, onChange }: BlockEditorProps<PackagesBlock>) {
  const resolvedBg = resolveSectionBackground(block.background);
  const backdropOn = resolvedBg.active;

  // Horizontal inset comes from the enclosing band shell / root inset row — apply only
  // the band's vertical rhythm here.
  const inner = (
    <div className={cn("min-w-0", backdropOn && PROPOSAL_EDITOR_SECTION_INNER_PAD_CLASSES)}>
      <PackagesInlineEditor block={block} onChange={onChange} />
    </div>
  );

  return (
    <ProposalSectionShell background={block.background} variant="editor">
      {backdropOn ? inner : (
        <div className="rounded-xl border border-dashed border-border/65 bg-muted/15 px-1 py-1 sm:bg-muted/[0.35]">
          {inner}
        </div>
      )}
    </ProposalSectionShell>
  );
}
