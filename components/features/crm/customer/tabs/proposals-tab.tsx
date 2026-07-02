"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";

import { AddProposalDialog } from "@/components/features/crm/customer/add-proposal-dialog";
import { CustomerProposalCard } from "@/components/features/crm/customer/customer-proposal-card";
import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; title: string } | null>(null);

  async function confirmDeleteProposal() {
    if (!deleteTarget) return;
    try {
      const res = await deleteProposalAction(deleteTarget.id);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      router.refresh();
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Proposals</CardTitle>
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
        <CardContent className="flex flex-col gap-3 pt-0">
          {proposalsMatched.length === 0 ? (
            <CustomerTabEmptyState icon={FileText} embedded>
              <p>No linked proposals yet.</p>
              <p>
                Use <strong className="text-foreground/90">Add proposal</strong> to create one from a
                template, or attach one when creating from an opportunity.
              </p>
            </CustomerTabEmptyState>
          ) : (
            proposalsMatched.map((proposal) => (
              <CustomerProposalCard
                key={proposal.id}
                proposal={proposal}
                customerId={customer.id}
                onDelete={(p) => setDeleteTarget({ id: p.id, title: p.title })}
              />
            ))
          )}
        </CardContent>
      </Card>

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
    </>
  );
}
