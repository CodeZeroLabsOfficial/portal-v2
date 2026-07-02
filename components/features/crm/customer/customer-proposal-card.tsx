"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getProposalStageBadgeDisplay } from "@/lib/proposal/status-badge";
import { cloneProposalAction, sendProposalAction } from "@/server/actions/proposal-builder";
import type { ProposalRecord } from "@/types/proposal";

function proposalSentCalendarParts(sentAt?: number): { month: string; day: string } {
  if (typeof sentAt !== "number" || sentAt <= 0) {
    return { month: "—", day: "—" };
  }
  const d = new Date(sentAt);
  return {
    month: d.toLocaleDateString(undefined, { month: "short" }),
    day: d.toLocaleDateString(undefined, { day: "2-digit" }),
  };
}

function proposalOpensLabel(viewCount: number | undefined): string {
  if (typeof viewCount !== "number") return "Opens not recorded";
  return viewCount === 1 ? "1 open" : `${viewCount} opens`;
}

function proposalEngagementLabel(totalEngagementSeconds: number | undefined): string {
  if (typeof totalEngagementSeconds !== "number") return "Engagement not recorded";
  const minutes = Math.max(0, Math.round(totalEngagementSeconds / 60));
  return `${minutes} min on page`;
}

function proposalStatsLine(proposal: ProposalRecord): string {
  const parts = [proposalOpensLabel(proposal.viewCount), proposalEngagementLabel(proposal.totalEngagementSeconds)];
  if (!proposal.sentAt && proposal.status === "draft") {
    parts.push("Not sent");
  }
  return parts.join(" · ");
}

export interface CustomerProposalCardProps {
  proposal: ProposalRecord;
  customerId: string;
  onDelete: (proposal: ProposalRecord) => void;
}

export function CustomerProposalCard({ proposal, customerId, onDelete }: CustomerProposalCardProps) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const stage = getProposalStageBadgeDisplay(proposal);
  const { month, day } = proposalSentCalendarParts(proposal.sentAt);
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
    <div className="bg-muted/50 flex items-center gap-3 rounded-lg border p-3">
      <div className="bg-background min-w-[4.5rem] shrink-0 rounded-lg border px-3 py-2 text-center">
        <p className="text-muted-foreground text-xs leading-none">{month}</p>
        <p className="mt-1 text-xl leading-none font-semibold tabular-nums">{day}</p>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 flex-1 truncate font-semibold leading-tight">{proposal.title}</p>
          <StatusBadge
            label={stage.label}
            variant={stage.variant}
            title={stage.title}
            className="shrink-0"
          />
        </div>
        <p className="text-muted-foreground truncate text-sm">{proposalStatsLine(proposal)}</p>
      </div>

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
    </div>
  );
}
