"use client";

import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";

export function renderPaymentBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "payment") return null;
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-foreground">
      <p className="font-medium">{block.label ?? "Payment"}</p>
      <p className="mt-1 text-muted-foreground">Your team can connect Stripe to collect payment in a follow-up step.</p>
    </div>
  );
}
