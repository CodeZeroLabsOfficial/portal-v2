"use client";

import Link from "next/link";
import { Clock, EllipsisVertical, Eye } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { getProposalStageBadgeDisplay } from "@/lib/proposal/status-badge";
import type { ProposalRecord } from "@/types/proposal";

function proposalOpensLabel(viewCount: number | undefined): string {
  if (typeof viewCount !== "number") return "Opens not recorded";
  return viewCount === 1 ? "1 open" : `${viewCount} opens`;
}

function proposalEngagementMinutes(totalEngagementSeconds: number | undefined): string | null {
  if (typeof totalEngagementSeconds !== "number") return null;
  return `${Math.max(0, Math.round(totalEngagementSeconds / 60))} min`;
}

export interface CustomerProposalCardProps {
  proposal: ProposalRecord;
  customerId: string;
  onDelete: (proposal: ProposalRecord) => void;
}

export function CustomerProposalCard({ proposal, customerId, onDelete }: CustomerProposalCardProps) {
  const stage = getProposalStageBadgeDisplay(proposal);
  const engagementMinutes = proposalEngagementMinutes(proposal.totalEngagementSeconds);
  const editHref = `/admin/proposals/${proposal.id}?customer=${encodeURIComponent(customerId)}`;

  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader className="relative space-y-1 pb-2">
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Proposal options">
                <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={editHref}>Edit proposal</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onSelect={() => onDelete(proposal)}>
                Delete proposal
              </DropdownMenuItem>
              {proposal.shareToken ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/p/${proposal.shareToken}`} target="_blank" rel="noopener noreferrer">
                      Open public link
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="pr-8 text-base font-semibold">{proposal.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-4 w-4" aria-hidden />
            {proposalOpensLabel(proposal.viewCount)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border px-2 py-1">
            <Clock className="h-4 w-4" aria-hidden />
            {engagementMinutes ?? "Engagement not recorded"}
          </span>
        </div>
        <Separator />
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <StatusBadge label={stage.label} variant={stage.variant} title={stage.title} />
        </div>
      </CardContent>
    </Card>
  );
}
