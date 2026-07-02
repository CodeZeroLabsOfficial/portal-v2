"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, ExternalLink, Eye, FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AddProposalDialog } from "@/components/features/crm/customer/add-proposal-dialog";
import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { getProposalStageBadgeDisplay } from "@/lib/proposal/status-badge";
import { deleteProposalAction } from "@/server/actions/proposal-builder";
import type { CustomerRecord } from "@/types/customer";
import type { ProposalRecord } from "@/types/proposal";
import type { ProposalTemplateRecord } from "@/types/proposal-template";

export interface CustomerProposalsTabProps {
  customer: CustomerRecord;
  proposalsMatched: ProposalRecord[];
  templates: ProposalTemplateRecord[];
}

export function CustomerProposalsTab({
  customer,
  proposalsMatched,
  templates,
}: CustomerProposalsTabProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);
  const [deletingProposalId, setDeletingProposalId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; title: string } | null>(null);

  async function confirmDeleteProposal() {
    if (!deleteTarget) return;
    setDeletingProposalId(deleteTarget.id);
    try {
      const res = await deleteProposalAction(deleteTarget.id);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      router.refresh();
    } finally {
      setDeletingProposalId(null);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Add proposal</CardTitle>
          <CardAction>
            <Button
              type="button"
              size="sm"
              className="gap-1.5 shadow-sm"
              onClick={() => setAddOpen(true)}>
              <Plus className="size-3.5" aria-hidden />
              Add proposal
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      {proposalsMatched.length === 0 ? (
        <CustomerTabEmptyState icon={FileText}>
          <p>No linked proposals yet.</p>
          <p>
            Use <strong className="text-foreground/90">Add proposal</strong> above to create one from a
            template, or attach one when creating from an opportunity.
          </p>
        </CustomerTabEmptyState>
      ) : (
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Proposals</h3>
          <ul className="space-y-2">
            {proposalsMatched.map((proposal) => {
              const stage = getProposalStageBadgeDisplay(proposal);
              return (
                <li
                  key={proposal.id}
                  className="border-border/60 bg-card/50 flex items-start justify-between gap-3 rounded-xl border px-4 py-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="truncate font-medium text-foreground">{proposal.title}</p>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="size-3.5 shrink-0" aria-hidden />
                        <span className="text-foreground/90">
                          {typeof proposal.viewCount === "number" ? (
                            <>
                              <span className="text-foreground font-medium tabular-nums">
                                {proposal.viewCount}
                              </span>
                              {proposal.viewCount === 1 ? " open" : " opens"}
                            </>
                          ) : (
                            "Opens not recorded"
                          )}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5 shrink-0" aria-hidden />
                        <span className="text-foreground/90">
                          {typeof proposal.totalEngagementSeconds === "number" ? (
                            <>
                              <span className="text-foreground font-medium tabular-nums">
                                {Math.max(0, Math.round(proposal.totalEngagementSeconds / 60))}
                              </span>
                              {" min on page"}
                            </>
                          ) : (
                            "Engagement not recorded"
                          )}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge label={stage.label} variant={stage.variant} title={stage.title} />
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/10 hover:text-destructive size-8"
                        disabled={deletingProposalId === proposal.id}
                        aria-label={`Delete proposal “${proposal.title}”`}
                        onClick={() => setDeleteTarget({ id: proposal.id, title: proposal.title })}>
                        {deletingProposalId === proposal.id ? (
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : (
                          <Trash2 className="size-4" aria-hidden />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8" asChild>
                        <Link
                          href={`/admin/proposals/${proposal.id}?customer=${encodeURIComponent(customer.id)}`}
                          aria-label={`Edit proposal “${proposal.title}”`}>
                          <Pencil className="size-4" aria-hidden />
                        </Link>
                      </Button>
                      {proposal.shareToken ? (
                        <Button variant="ghost" size="icon" className="size-8" asChild>
                          <Link
                            href={`/p/${proposal.shareToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open public proposal preview">
                            <ExternalLink className="size-4" aria-hidden />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <AddProposalDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        customerId={customer.id}
        templates={templates}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete proposal"
        description={
          deleteTarget
            ? `Delete proposal “${deleteTarget.title}”? This cannot be undone.`
            : "Delete this proposal?"
        }
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDeleteProposal}
      />
    </div>
  );
}
