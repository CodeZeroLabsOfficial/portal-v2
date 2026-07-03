"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, EllipsisVertical, FileText } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import * as Kanban from "@/components/ui/kanban";
import { Separator } from "@/components/ui/separator";
import { formatCurrencyAmount, initialsFromName } from "@/lib/common/format";
import { opportunityStageBadgeDisplay } from "@/lib/crm/status-badges";
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

export interface OpportunityKanbanCardProps {
  opp: OpportunityBoardCard;
  disabled?: boolean;
}

export function OpportunityKanbanCard({ opp, disabled }: OpportunityKanbanCardProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const notes = opp.opportunityNoteCount ?? 0;
  const activities = opp.opportunityActivityCount ?? 0;
  const hasAssignee = Boolean(opp.assigneeUid?.trim());
  const assigneeLabel = hasAssignee ? opp.assigneeDisplayName?.trim() || "Team member" : "Unassigned";
  const photo = opp.assigneePhotoUrl?.trim();
  const initialsSource = hasAssignee ? opp.assigneeDisplayName?.trim() || assigneeLabel : "";
  const stageBadge = opportunityStageBadgeDisplay(opp.stage);

  const descriptionParts = [opp.leadContactName, opp.accountCompanyName].filter(Boolean);
  const description = descriptionParts.join(" · ");

  async function handleDelete() {
    setIsDeleting(true);
    const res = await deleteOpportunityAction({ opportunityId: opp.id });
    setIsDeleting(false);
    if (!res.ok) throw new Error(res.message);
    router.refresh();
  }

  return (
    <>
      <Kanban.Item value={opp.id} asHandle asChild disabled={disabled || isDeleting}>
        <Card className="border-0">
          <CardHeader className="relative space-y-1 pb-2">
            <div className="absolute top-3 right-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onPointerDown={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
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
                    <Link href={`/admin/customers/${opp.customerId}`}>View Profile</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardTitle className="pr-8 text-base font-semibold">
              <Link
                href={`/admin/opportunities/${opp.id}`}
                onPointerDown={(e) => e.stopPropagation()}
                className="underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {opp.name}
              </Link>
            </CardTitle>
            {description ? (
              <CardDescription className="line-clamp-2">{description}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-muted-foreground space-y-0.5 text-xs leading-snug">
              <p>Created: {formatOpportunityCardDate(opp.createdAt)}</p>
              <p>Last update: {formatOpportunityCardDate(opp.updatedAt)}</p>
            </div>
            {typeof opp.amountMinor === "number" ? (
              <p className="text-sm tabular-nums">
                {formatCurrencyAmount(opp.amountMinor, opp.currency)}
              </p>
            ) : null}
            <Separator />
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Avatar size="sm" className="ring-2 ring-background" title={assigneeLabel}>
                  {photo ? <AvatarImage src={photo} alt="" /> : null}
                  <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                    {hasAssignee ? initialsFromName(initialsSource) : "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{stageBadge.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1" title="Notes on this deal">
                  <FileText className="h-4 w-4" aria-hidden />
                  {notes}
                </span>
                <span className="inline-flex items-center gap-1" title="Activities on this deal">
                  <Activity className="h-4 w-4" aria-hidden />
                  {activities}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Kanban.Item>

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
