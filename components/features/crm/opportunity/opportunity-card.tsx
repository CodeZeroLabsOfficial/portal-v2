"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Activity, CalendarDays, EllipsisVertical, MessageSquare, Phone, User } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import * as Kanban from "@/components/ui/kanban";
import { Separator } from "@/components/ui/separator";
import { initialsFromName } from "@/lib/common/format";
import { deleteOpportunityAction } from "@/server/actions/opportunities-crm";
import type { OpportunityBoardCard } from "@/types/opportunity";

function opportunityCardTitle(opp: OpportunityBoardCard): { title: string; hasCompany: boolean } {
  const companyName = opp.accountCompanyName.trim();
  const leadName = opp.leadContactName.trim();
  // Company label falls back to the person when no account is linked.
  const hasCompany = companyName.length > 0 && companyName !== "—" && companyName !== leadName;
  const title = hasCompany ? companyName : leadName || "—";
  return { title, hasCompany };
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
  const { title, hasCompany } = opportunityCardTitle(opp);
  const leadName = opp.leadContactName.trim();
  const showLeadName = hasCompany && leadName.length > 0 && leadName !== "—";
  const phone = opp.leadPhone?.trim() || "";
  const updatedLabel =
    typeof opp.updatedAt === "number" && opp.updatedAt
      ? format(new Date(opp.updatedAt), "MMM d")
      : null;

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
        <Card className="relative border-0">
          <div className="absolute top-2 right-2 z-10">
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
                  <Link href={`/admin/opportunities/${opp.id}`}>Open</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={`/admin/customers/${opp.customerId}`}>View Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onSelect={() => setConfirmOpen(true)}>
                  Delete deal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="pe-8 text-base font-semibold">
                <Link
                  href={`/admin/opportunities/${opp.id}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {title}
                </Link>
              </div>
              {showLeadName || phone ? (
                <div className="text-muted-foreground space-y-0.5 text-sm">
                  {showLeadName ? (
                    <p className="flex items-center gap-1.5">
                      <User className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{leadName}</span>
                    </p>
                  ) : null}
                  {phone ? (
                    <p className="flex items-center gap-1.5">
                      <Phone className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{phone}</span>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="text-muted-foreground flex items-center text-sm">
              <Avatar className="border-background size-7 border-2" title={assigneeLabel}>
                {photo ? <AvatarImage src={photo} alt="" /> : null}
                <AvatarFallback>
                  {hasAssignee ? initialsFromName(initialsSource) : "?"}
                </AvatarFallback>
              </Avatar>
            </div>
            <Separator />
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              {updatedLabel ? (
                <span className="flex items-center gap-1 text-xs whitespace-nowrap">
                  <CalendarDays className="size-3.5" />
                  {updatedLabel}
                </span>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1" title="Notes on this deal">
                  <MessageSquare className="size-4" aria-hidden />
                  {notes}
                </span>
                <span className="inline-flex items-center gap-1" title="Activities on this deal">
                  <Activity className="size-4" aria-hidden />
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
