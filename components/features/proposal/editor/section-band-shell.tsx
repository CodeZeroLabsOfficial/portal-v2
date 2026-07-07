import { ProposalSectionShell } from "@/components/proposal/proposal-section-shell";
import { resolveSectionBackground } from "@/lib/proposal/section-background";
import { PROPOSAL_EDITOR_BLOCK_CANVAS_INNER_CLASSES } from "@/lib/proposal/public/public-layout";
import type { SectionBackground } from "@/types/proposal";

/**
 * Editor wrapper around {@link ProposalSectionShell} shared by Section and Agreement bands.
 * With an active backdrop the content sits in the band's inner column; without one it falls
 * back to a dashed placeholder band. Full-bleed: the shell itself has no radius or side gutter.
 */
export function SectionBandShell({
  background,
  children,
}: {
  background?: SectionBackground;
  children: React.ReactNode;
}) {
  const backdropOn = resolveSectionBackground(background).active;
  return (
    <ProposalSectionShell background={background} variant="editor">
      {backdropOn ? (
        <div className={PROPOSAL_EDITOR_BLOCK_CANVAS_INNER_CLASSES}>{children}</div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/65 bg-muted/15 px-1 py-1 sm:bg-muted/[0.35]">
          {children}
        </div>
      )}
    </ProposalSectionShell>
  );
}
