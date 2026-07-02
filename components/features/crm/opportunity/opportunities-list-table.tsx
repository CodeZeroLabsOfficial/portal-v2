"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, EllipsisVertical, FileText } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formatCurrencyAmount, initialsFromName } from "@/lib/common/format";
import { OPPORTUNITY_STAGES, opportunityStageLabel } from "@/lib/crm/opportunity-stages";
import { cn } from "@/lib/utils";
import { useOpportunityStageMutation } from "@/hooks/use-opportunity-stage-mutation";
import { deleteOpportunityAction } from "@/server/actions/opportunities-crm";
import type { OpportunityBoardCard, OpportunityStage } from "@/types/opportunity";

export interface OpportunitiesListTableProps {
  opportunities: OpportunityBoardCard[];
}

export function OpportunitiesListTable({ opportunities }: OpportunitiesListTableProps) {
  const router = useRouter();
  const { moveStage, pendingId } = useOpportunityStageMutation();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<OpportunityBoardCard | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  function requestDelete(opp: OpportunityBoardCard) {
    setDeleteTarget(opp);
    setConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    const res = await deleteOpportunityAction({ opportunityId: deleteTarget.id });
    setDeletingId(null);
    if (!res.ok) throw new Error(res.message);
    router.refresh();
  }

  const columns = React.useMemo<ColumnDef<OpportunityBoardCard>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Deal" />,
        cell: ({ row }) => {
          const opp = row.original;
          const hasAssignee = Boolean(opp.assigneeUid?.trim());
          const photo = opp.assigneePhotoUrl?.trim();
          const assigneeLabel = hasAssignee ? opp.assigneeDisplayName?.trim() || "Team member" : "Unassigned";
          const initialsSource = hasAssignee ? opp.assigneeDisplayName?.trim() || assigneeLabel : "";

          return (
            <div className="flex items-center gap-2">
              <Avatar size="sm" title={assigneeLabel}>
                {photo ? <AvatarImage src={photo} alt="" /> : null}
                <AvatarFallback className="text-[11px] font-semibold">
                  {hasAssignee ? initialsFromName(initialsSource) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <Link
                  href={`/admin/opportunities/${opp.id}`}
                  className="block truncate font-medium underline-offset-4 hover:underline">
                  {opp.name}
                </Link>
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: "accountCompanyName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Account" />,
        cell: ({ row }) => (
          <Link
            href={`/admin/customers/${row.original.customerId}`}
            className="block max-w-[200px] truncate font-medium underline-offset-4 hover:text-primary hover:underline">
            {row.original.accountCompanyName}
          </Link>
        )
      },
      {
        accessorKey: "leadContactName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
        cell: ({ row }) => (
          <Link
            href={`/admin/customers/${row.original.customerId}`}
            className="block max-w-[200px] truncate text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {row.original.leadContactName}
          </Link>
        )
      },
      {
        accessorKey: "stage",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Stage" />,
        cell: ({ row }) => {
          const opp = row.original;
          const rowDisabled = pendingId === opp.id || deletingId === opp.id;

          return (
            <Select
              value={opp.stage}
              disabled={rowDisabled}
              onValueChange={(value) => {
                const next = value as OpportunityStage;
                if (next !== opp.stage) void moveStage(opp.id, next);
              }}>
              <SelectTrigger className={cn("h-8 w-[160px]", rowDisabled && "opacity-60")} aria-label={`Stage for ${opp.name}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPPORTUNITY_STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {opportunityStageLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id))
      },
      {
        accessorKey: "amountMinor",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
        cell: ({ row }) => {
          const opp = row.original;
          return (
            <span className="tabular-nums text-muted-foreground">
              {typeof opp.amountMinor === "number"
                ? formatCurrencyAmount(opp.amountMinor, opp.currency)
                : "—"}
            </span>
          );
        }
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.updatedAt
              ? new Date(row.original.updatedAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short"
                })
              : "—"}
          </span>
        )
      },
      {
        id: "notes",
        header: () => <span className="sr-only">Notes</span>,
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center gap-1 tabular-nums text-muted-foreground">
            <FileText className="h-3.5 w-3.5" aria-hidden />
            {row.original.opportunityNoteCount ?? 0}
          </span>
        ),
        enableSorting: false
      },
      {
        id: "activities",
        header: () => <span className="sr-only">Activities</span>,
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center gap-1 tabular-nums text-muted-foreground">
            <Activity className="h-3.5 w-3.5" aria-hidden />
            {row.original.opportunityActivityCount ?? 0}
          </span>
        ),
        enableSorting: false
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const opp = row.original;
          const rowDisabled = pendingId === opp.id || deletingId === opp.id;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={rowDisabled}
                  aria-label={`Actions for ${opp.name}`}>
                  <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={`/admin/opportunities/${opp.id}`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onSelect={() => requestDelete(opp)}>
                  Delete deal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/admin/customers/${opp.customerId}`}>Open account</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false
      }
    ],
    [deletingId, pendingId, moveStage]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={opportunities}
        initialPageSize={50}
        emptyMessage="No opportunities yet. Convert a lead or create deals from the customer profile."
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete pipeline deal"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}" and its notes/activities? This cannot be undone.`
            : "Delete this pipeline deal and its notes/activities? This cannot be undone."
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
