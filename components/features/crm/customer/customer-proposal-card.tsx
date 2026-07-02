"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { CustomerDetailListRow } from "@/components/features/crm/customer/customer-detail-list-row";
import { CustomerProposalEngagementMeta } from "@/components/features/crm/customer/customer-proposal-engagement-meta";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { proposalSentLabel } from "@/lib/crm/customer-tab-labels";
import { getProposalStageBadgeDisplay } from "@/lib/proposal/status-badge";
import { cloneProposalAction, sendProposalAction } from "@/server/actions/proposal-builder";
import type { ProposalRecord } from "@/types/proposal";

export interface CustomerProposalCardProps {
  proposal: ProposalRecord;
  customerId: string;
  onDelete: (proposal: ProposalRecord) => void;
}

export function CustomerProposalCard({ proposal, customerId, onDelete }: CustomerProposalCardProps) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const stage = getProposalStageBadgeDisplay(proposal);
  const editHref = `/admin/proposals/${proposal.id}?customer=${encodeURIComponent(customerId)}`;
  const canOpenPublic = Boolean(proposal.shareToken?.trim()) && proposal.status !== "draft";
  const canSend = proposal.status === "draft";

  async function handleSend() {
    setBusy(true);
    try {
      const res = await sendProposalAction(proposal.id);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Proposal sent.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDuplicate() {
    setBusy(true);
    try {
      const res = await cloneProposalAction(proposal.id);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Proposal duplicated.");
      router.push(`/admin/proposals/${res.proposalId}?customer=${encodeURIComponent(customerId)}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <CustomerDetailListRow
      title={proposal.title}
      dateLabel={proposalSentLabel(proposal.sentAt)}
      badge={<StatusBadge label={stage.label} variant={stage.variant} title={stage.title} />}
      meta={<CustomerProposalEngagementMeta proposal={proposal} />}
      action={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              disabled={busy}
              aria-label={`Actions for proposal “${proposal.title}”`}>
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <MoreHorizontal className="size-4" aria-hidden />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={editHref}>Open in editor</Link>
            </DropdownMenuItem>
            {canOpenPublic ? (
              <DropdownMenuItem asChild>
                <Link href={`/p/${proposal.shareToken}`} target="_blank" rel="noopener noreferrer">
                  Open public link
                </Link>
              </DropdownMenuItem>
            ) : null}
            {canSend ? (
              <DropdownMenuItem onSelect={() => void handleSend()}>Send proposal</DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onSelect={() => void handleDuplicate()}>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => onDelete(proposal)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    />
  );
}
