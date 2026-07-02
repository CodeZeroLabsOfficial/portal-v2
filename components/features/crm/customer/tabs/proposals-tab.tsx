"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, ExternalLink, Eye, FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useProposalTemplatePickerState } from "@/hooks/use-proposal-template-picker-state";
import { getProposalStageBadgeDisplay } from "@/lib/proposal/status-badge";
import { cn } from "@/lib/utils";
import { deleteProposalAction } from "@/server/actions/proposal-builder";
import { createDraftProposalFromCustomerAction } from "@/server/actions/proposals-crm";
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
  templates
}: CustomerProposalsTabProps) {
  const router = useRouter();
  const { proposalTemplateId, setProposalTemplateId } = useProposalTemplatePickerState(templates);
  const [createBusy, setCreateBusy] = React.useState(false);
  const [deletingProposalId, setDeletingProposalId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; title: string } | null>(null);

  async function createProposalFromCustomer() {
    setCreateBusy(true);
    try {
      const res = await createDraftProposalFromCustomerAction(
        customer.id,
        proposalTemplateId.trim() ? proposalTemplateId.trim() : undefined
      );
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      router.push(`/admin/proposals/${res.proposalId}?customer=${encodeURIComponent(customer.id)}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create proposal. Please try again.");
    } finally {
      setCreateBusy(false);
    }
  }

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
    <>
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Add proposal</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-end gap-2">
          {templates.length > 0 ? (
            <Select
              value={proposalTemplateId}
              onValueChange={setProposalTemplateId}
              disabled={createBusy}>
              <SelectTrigger className="min-w-[220px]" aria-label="Template">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <Button
            type="button"
            size="sm"
            className="gap-1.5 shadow-sm"
            disabled={createBusy}
            onClick={() => void createProposalFromCustomer()}>
            {createBusy ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <Plus className="size-3.5" aria-hidden />
            )}
            Add proposal
          </Button>
        </CardContent>
      </Card>

      {proposalsMatched.length === 0 ? (
        <CustomerTabEmptyState icon={FileText}>
          <p>No linked proposals yet.</p>
          <p>
            Use <strong className="text-foreground/90">Add proposal</strong> above, or attach one when creating
            from an opportunity.
          </p>
        </CustomerTabEmptyState>
      ) : (
        <ul className="space-y-2">
          {proposalsMatched.map((proposal) => {
            const stage = getProposalStageBadgeDisplay(proposal);
            return (
              <li
                key={proposal.id}
                className="border-border/60 bg-card/50 flex flex-col gap-3 rounded-xl border px-4 py-3">
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <p className="min-w-0 flex-1 font-medium text-foreground">{proposal.title}</p>
                  <div className="text-muted-foreground flex shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-1 text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
                      <span className="text-foreground/90">
                        {typeof proposal.viewCount === "number" ? (
                          <>
                            <span className="text-foreground font-medium tabular-nums">{proposal.viewCount}</span>
                            {proposal.viewCount === 1 ? " open" : " opens"}
                          </>
                        ) : (
                          "Opens not recorded"
                        )}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
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
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
                    <StatusBadge
                      label={stage.label}
                      variant="secondary"
                      className={cn(stage.className)}
                      title={stage.title}
                    />
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 sm:ml-auto">
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
      )}

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
    </>
  );
}
