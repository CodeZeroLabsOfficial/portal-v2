"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDraggable } from "@dnd-kit/core";
import { Activity, EllipsisVertical, FileText } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { formatCurrencyAmount, initialsFromName } from "@/lib/common/format";
import { opportunityStageBadgeDisplay } from "@/lib/crm/status-badges";
import { cn } from "@/lib/utils";
import { deleteOpportunityAction } from "@/server/actions/opportunities-crm";
import type { OpportunityBoardCard } from "@/types/opportunity";

function formatOpportunityCardDate(ms: number | undefined): string {
  if (typeof ms !== "number" || !ms) return "—";
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export interface OpportunityCardProps {
  opp: OpportunityBoardCard;
  disabled?: boolean;
}

export function OpportunityCard({ opp, disabled }: OpportunityCardProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opp.id,
    disabled: disabled || isDeleting
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined;

  const notes = opp.opportunityNoteCount ?? 0;
  const activities = opp.opportunityActivityCount ?? 0;
  const hasAssignee = Boolean(opp.assigneeUid?.trim());
  const assigneeLabel = hasAssignee ? opp.assigneeDisplayName?.trim() || "Team member" : "Unassigned";
  const photo = opp.assigneePhotoUrl?.trim();
  const initialsSource = hasAssignee ? opp.assigneeDisplayName?.trim() || assigneeLabel : "";
  const stageBadge = opportunityStageBadgeDisplay(opp.stage);

  async function handleDelete() {
    setIsDeleting(true);
    const res = await deleteOpportunityAction({ opportunityId: opp.id });
    setIsDeleting(false);
    if (!res.ok) throw new Error(res.message);
    router.refresh();
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "rounded-xl border border-border/70 bg-card shadow-sm transition-colors",
          isDragging && "opacity-40",
          (disabled || isDeleting) && "pointer-events-none opacity-60"
        )}>
        <div {...listeners} {...attributes} className="cursor-grab p-3 active:cursor-grabbing">
          <div className="flex items-start justify-between gap-2">
            <StatusBadge label={stageBadge.label} variant={stageBadge.variant} className="max-w-[min(100%,12rem)] truncate" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild onPointerDown={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-1 -mt-1 h-7 w-7 shrink-0"
                  aria-label="Pipeline deal options">
                  <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={`/admin/opportunities/${opp.id}`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onSelect={() => setConfirmOpen(true)}>
                  Delete deal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/admin/customers/${opp.customerId}`}>Open account</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Link
            href={`/admin/opportunities/${opp.id}`}
            onPointerDown={(e) => e.stopPropagation()}
            className="mt-2 block text-[13px] font-semibold leading-snug text-foreground underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {opp.name}
          </Link>
          <Link
            href={`/admin/customers/${opp.customerId}`}
            onPointerDown={(e) => e.stopPropagation()}
            className="mt-1.5 block truncate text-[12px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {opp.leadContactName}
          </Link>
          <div className="mt-1.5 space-y-0.5 text-[11px] leading-snug text-muted-foreground">
            <p>Created: {formatOpportunityCardDate(opp.createdAt)}</p>
            <p>Last update: {formatOpportunityCardDate(opp.updatedAt)}</p>
          </div>

          {typeof opp.amountMinor === "number" ? (
            <p className="mt-2 text-[12px] tabular-nums text-muted-foreground">
              {formatCurrencyAmount(opp.amountMinor, opp.currency)}
            </p>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-2">
            <Avatar size="sm" className="ring-2 ring-background" title={assigneeLabel}>
              {photo ? <AvatarImage src={photo} alt="" /> : null}
              <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                {hasAssignee ? initialsFromName(initialsSource) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-3 text-[11px] tabular-nums text-muted-foreground">
              <span className="inline-flex items-center gap-1" title="Notes on this deal">
                <FileText className="h-3.5 w-3.5" aria-hidden />
                {notes}
              </span>
              <span className="inline-flex items-center gap-1" title="Activities on this deal">
                <Activity className="h-3.5 w-3.5" aria-hidden />
                {activities}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete pipeline deal"
        description="Delete this pipeline deal and its notes/activities? This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}

export { formatOpportunityCardDate };
