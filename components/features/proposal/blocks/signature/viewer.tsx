"use client";

import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";

export function renderSignatureBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "signature") return null;
  return (
    <div className="rounded-xl border border-border/70 bg-muted/10 p-4">
      <p className="text-sm font-medium text-foreground">{block.title ?? "Authorization"}</p>
      {block.termsSummary ? (
        <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{block.termsSummary}</p>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">
        {block.signerLabel ?? "Signatory"} — use the acceptance section at the end of this page.
      </p>
    </div>
  );
}
