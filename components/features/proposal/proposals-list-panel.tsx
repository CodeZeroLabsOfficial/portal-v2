"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef, Table } from "@tanstack/react-table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Copy, ExternalLink, FileText, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { DataTableBulkToolbar } from "@/components/shared/data-table/data-table-bulk-toolbar";
import { DataTableFacetedFilter } from "@/components/shared/data-table/data-table-faceted-filter";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { multiSelectColumnFilter } from "@/lib/crm/table-filters";
import { formatLastEditedInLocality } from "@/lib/proposal/public/locality-dates";
import {
  canOpenPublicProposal,
  proposalEditHref,
  proposalPublicUrl
} from "@/lib/proposal/row-actions";
import {
  getProposalStageBadgeDisplay,
  type ProposalStageBadgeKey
} from "@/lib/proposal/status-badge";
import { cloneProposalAction, deleteProposalAction } from "@/server/actions/proposal-builder";
import type { ProposalHubListRow } from "@/types/proposal";

export interface ProposalsListPanelProps {
  rows: ProposalHubListRow[];
  localityTimeZone?: string;
}

interface ProposalListTableRow extends ProposalHubListRow {
  stageKey: ProposalStageBadgeKey;
}

const PROPOSAL_STAGE_FILTER_OPTIONS: { value: ProposalStageBadgeKey; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "viewed", label: "Viewed" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "expired", label: "Expired" }
];

function mapToTableRows(rows: ProposalHubListRow[]): ProposalListTableRow[] {
  return rows.map((row) => ({
    ...row,
    stageKey: getProposalStageBadgeDisplay(row).badgeKey
  }));
}

function ProposalsListToolbar({
  table,
  onBulkDelete,
  bulkDeleteDisabled,
}: {
  table: Table<ProposalListTableRow>;
  onBulkDelete: () => void;
  bulkDeleteDisabled: boolean;
}) {
  return (
    <DataTableBulkToolbar
      table={table}
      onBulkDelete={onBulkDelete}
      bulkDeleteDisabled={bulkDeleteDisabled}
      filters={
        <>
          <Input
            placeholder="Search title, account, contact…"
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
            className="h-8 w-full sm:max-w-xs"
          />
          {table.getColumn("stageKey") ? (
            <DataTableFacetedFilter
              column={table.getColumn("stageKey")}
              title="Status"
              options={PROPOSAL_STAGE_FILTER_OPTIONS}
            />
          ) : null}
        </>
      }
    />
  );
}

export function ProposalsListPanel({ rows, localityTimeZone }: ProposalsListPanelProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmMeta, setConfirmMeta] = React.useState({
    title: "",
    description: "",
    confirmLabel: "Continue",
    destructive: false
  });
  const [confirmAction, setConfirmAction] = React.useState<(() => Promise<void>) | null>(null);
  const tableRef = React.useRef<Table<ProposalListTableRow> | null>(null);

  React.useEffect(() => {
    router.refresh();
  }, [router]);

  const tableRows = React.useMemo(() => mapToTableRows(rows), [rows]);

  function openConfirm(opts: {
    title: string;
    description: string;
    confirmLabel?: string;
    destructive?: boolean;
    action: () => Promise<void>;
  }) {
    setConfirmMeta({
      title: opts.title,
      description: opts.description,
      confirmLabel: opts.confirmLabel ?? "Continue",
      destructive: opts.destructive ?? false
    });
    setConfirmAction(() => opts.action);
    setConfirmOpen(true);
  }

  async function handleClone(row: ProposalListTableRow) {
    setPendingId(row.id);
    try {
      const res = await cloneProposalAction(row.id);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Proposal duplicated.");
      router.push(proposalEditHref({ ...row, id: res.proposalId }));
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  function handleDelete(row: ProposalListTableRow) {
    openConfirm({
      title: "Delete proposal",
      description: `Delete proposal “${row.title}”? This cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
      action: async () => {
        setPendingId(row.id);
        try {
          const res = await deleteProposalAction(row.id);
          if (!res.ok) throw new Error(res.message);
          toast.success("Proposal deleted.");
          router.refresh();
        } finally {
          setPendingId(null);
        }
      }
    });
  }

  function handleBulkDelete() {
    const table = tableRef.current;
    if (!table) return;
    const selected = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
    if (selected.length === 0) return;
    openConfirm({
      title: `Delete ${selected.length} proposal${selected.length === 1 ? "" : "s"}`,
      description: "Delete selected proposals? This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
      action: async () => {
        setBulkBusy(true);
        const failed: string[] = [];
        for (const row of selected) {
          const res = await deleteProposalAction(row.id);
          if (!res.ok) failed.push(row.id);
        }
        setBulkBusy(false);
        if (failed.length > 0) {
          toast.error(`Deleted ${selected.length - failed.length} of ${selected.length}. ${failed.length} failed.`);
        } else {
          toast.success(`Deleted ${selected.length} proposal${selected.length === 1 ? "" : "s"}.`);
          table.resetRowSelection();
        }
        router.refresh();
      }
    });
  }

  const columns = React.useMemo<ColumnDef<ProposalListTableRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select proposal “${row.original.title}”`}
          />
        ),
        enableSorting: false,
        enableHiding: false
      },
      {
        accessorKey: "title",
        meta: { viewLabel: "Title" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => (
          <Link
            href={proposalEditHref(row.original)}
            className="line-clamp-2 font-medium hover:underline">
            {row.original.title}
          </Link>
        ),
        filterFn: (row, _id, value) => {
          const q = String(value).toLowerCase();
          if (!q) return true;
          const r = row.original;
          const stage = getProposalStageBadgeDisplay(r);
          const hay = [
            r.title,
            r.accountCompanyName,
            r.contactName,
            stage.label,
            formatLastEditedInLocality(r.updatedAt, localityTimeZone)
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        }
      },
      {
        accessorKey: "accountCompanyName",
        meta: { viewLabel: "Account" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Account" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.accountCompanyName}</span>
        )
      },
      {
        accessorKey: "contactName",
        meta: { viewLabel: "Contact" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.contactName}</span>
        )
      },
      {
        id: "stageKey",
        accessorKey: "stageKey",
        meta: { viewLabel: "Status" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        filterFn: multiSelectColumnFilter,
        cell: ({ row }) => {
          const display = getProposalStageBadgeDisplay(row.original);
          return <StatusBadge label={display.label} variant={display.variant} title={display.title} />;
        }
      },
      {
        accessorKey: "updatedAt",
        meta: { viewLabel: "Last Edited" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Last edited" />,
        cell: ({ row }) => (
          <time
            className="text-muted-foreground tabular-nums"
            dateTime={
              row.original.updatedAt > 0
                ? new Date(row.original.updatedAt).toISOString()
                : undefined
            }>
            {formatLastEditedInLocality(row.original.updatedAt, localityTimeZone)}
          </time>
        )
      },
      {
        id: "actions",
        header: () => null,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const proposal = row.original;
          const busy = pendingId === proposal.id || bulkBusy;
          const editHref = proposalEditHref(proposal);
          const publicUrl = proposalPublicUrl(proposal);
          const canOpenPublic = canOpenPublicProposal(proposal);

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canOpenPublic && publicUrl ? (
                  <DropdownMenuItem asChild>
                    <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink aria-hidden />
                      Open
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild>
                  <Link href={editHref}>
                    <Pencil aria-hidden />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void handleClone(proposal)}>
                  <Copy aria-hidden />
                  Clone
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => handleDelete(proposal)}>
                  <Trash2 aria-hidden />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      }
    ],
    [bulkBusy, localityTimeZone, pendingId]
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Proposals" description="All proposals for your organization." />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmMeta.title}
        description={confirmMeta.description}
        confirmLabel={confirmMeta.confirmLabel}
        destructive={confirmMeta.destructive}
        onConfirm={async () => {
          if (confirmAction) await confirmAction();
        }}
      />

      <DataTable
        columns={columns}
        data={tableRows}
        initialPageSize={25}
        initialSorting={[{ id: "updatedAt", desc: true }]}
        emptyMessage={
          rows.length === 0 ? (
            <Empty className="border-0 py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>No proposals yet</EmptyTitle>
                <EmptyDescription>
                  Create a proposal from a customer or opportunity to get started.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            "No proposals match your filters."
          )
        }
        toolbar={(table) => {
          tableRef.current = table;
          return (
            <ProposalsListToolbar
              table={table}
              onBulkDelete={handleBulkDelete}
              bulkDeleteDisabled={bulkBusy}
            />
          );
        }}
      />
    </div>
  );
}
