import { cloneBlockWithFreshIds } from "@/lib/proposal/clone-block";
import type { ProposalBranding, ProposalDocument } from "@/types/proposal";

/** Deep-clone a proposal document with fresh block (and nested) ids so templates don’t share identities with instances. */
export function cloneProposalDocument(doc: ProposalDocument): ProposalDocument {
  return {
    title: doc.title,
    blocks: doc.blocks.map((block) => cloneBlockWithFreshIds(block)),
  };
}

/** Snapshot branding when copying template → proposal instance (best-effort). */
export function cloneBrandingFromTemplate(branding: ProposalBranding | undefined): ProposalBranding | undefined {
  if (!branding) return undefined;
  return { ...branding };
}
