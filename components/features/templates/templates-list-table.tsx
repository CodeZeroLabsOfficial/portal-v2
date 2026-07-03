"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, EllipsisVertical, LayoutTemplate, Loader2, Trash2 } from "lucide-react";
import type { ColumnDef, Table } from "@tanstack/react-table";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { DataTableBulkToolbar } from "@/components/shared/data-table/data-table-bulk-toolbar";
import { DataTableFacetedFilter } from "@/components/shared/data-table/data-table-faceted-filter";
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatLastEditedInLocality } from "@/lib/proposal/public/locality-dates";
import type { TemplateHubRow } from "@/lib/templates/hub-rows";
import {
  templateStageBadgeDisplay,
  templateStageBadgeTitle,
  templateTypeBadgeDisplay
} from "@/lib/templates/status-badges";
import {
  cloneContractTemplateAction,
  deleteContractTemplateAction,
  setContractTemplateStageAction
} from "@/server/actions/contract-templates";
import {
  cloneProposalTemplateAction,
  deleteProposalTemplateAction,
  setProposalTemplateStageAction
} from "@/server/actions/proposal-templates";
import type { ProposalTemplateStage } from "@/types/proposal-template";

export interface TemplatesListTableProps {
  rows: TemplateHubRow[];
  localityTimeZone?: string;
}

function TemplatesToolbar({
  table,
  onBulkDelete,
  bulkDeleteDisabled,
}: {
  table: Table<TemplateHubRow>;
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
            placeholder="Search name, type, stage, or date…"
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
            className="h-8 w-full sm:max-w-xs"
          />
          {table.getColumn("typeLabel") ? (
            <DataTableFacetedFilter
              column={table.getColumn("typeLabel")}
              title="Type"
              options={[
                { label: "Proposal", value: "proposal" },
                { label: "Contract", value: "contract" },
              ]}
            />
          ) : null}
          {table.getColumn("stage") ? (
            <DataTableFacetedFilter
              column={table.getColumn("stage")}
              title="Stage"
              options={[
                { label: "Draft", value: "draft" },
                { label: "Published", value: "published" },
              ]}
            />
          ) : null}
        </>
      }
    />
  );
}

export function TemplatesListTable({ rows, localityTimeZone }: TemplatesListTableProps) {
  const router = useRouter();
  const tableRef = React.useRef<Table<TemplateHubRow> | null>(null);
  const [pendingKey, setPendingKey] = React.useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<(() => Promise<void>) | null>(null);
  const [confirmMeta, setConfirmMeta] = React.useState({
    title: "",
    description: "",
    destructive: true
  });

  React.useEffect(() => {
    router.refresh();
  }, [router]);

  function openConfirm(
    meta: { title: string; description: string; destructive?: boolean },
    action: () => Promise<void>
  ) {
    setConfirmMeta({
      title: meta.title,
      description: meta.description,
      destructive: meta.destructive ?? true
    });
    setConfirmAction(() => action);
    setConfirmOpen(true);
  }

  async function deleteRow(row: TemplateHubRow) {
    setPendingKey(row.key);
    const res =
      row.kind === "proposal"
        ? await deleteProposalTemplateAction(row.id)
        : await deleteContractTemplateAction(row.id);
    setPendingKey(null);
    if (!res.ok) throw new Error(res.message);
    router.refresh();
  }

  async function updateStage(row: TemplateHubRow, stage: ProposalTemplateStage) {
    setPendingKey(row.key);
    const res =
      row.kind === "proposal"
        ? await setProposalTemplateStageAction(row.id, stage)
        : await setContractTemplateStageAction(row.id, stage);
    setPendingKey(null);
    if (!res.ok) throw new Error(res.message);
    router.refresh();
  }

  async function cloneRow(row: TemplateHubRow) {
    setPendingKey(row.key);
    if (row.kind === "proposal") {
      const res = await cloneProposalTemplateAction(row.id);
      setPendingKey(null);
      if (!res.ok) throw new Error(res.message);
      router.push(`/admin/templates/${res.templateId}`);
    } else {
      const res = await cloneContractTemplateAction(row.id);
      setPendingKey(null);
      if (!res.ok) throw new Error(res.message);
      router.push(`/admin/templates/contracts/${res.contractTemplateId}`);
    }
    router.refresh();
  }

  function requestDelete(row: TemplateHubRow) {
    const description =
      row.kind === "proposal"
        ? `Delete template "${row.name}"? This cannot be undone.`
        : `Delete contract template "${row.name}"? Proposals that already copied its text are unchanged.`;
    openConfirm({ title: "Delete template", description }, () => deleteRow(row));
  }

  function handleBulkDelete() {
    const table = tableRef.current;
    if (!table) return;
    const selected = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
    if (selected.length === 0) return;
    openConfirm(
      {
        title: `Delete ${selected.length} template${selected.length === 1 ? "" : "s"}`,
        description: `Delete selected templates? This cannot be undone.`
      },
      async () => {
        setBulkBusy(true);
        const failed: string[] = [];
        for (const row of selected) {
          const res =
            row.kind === "proposal"
              ? await deleteProposalTemplateAction(row.id)
              : await deleteContractTemplateAction(row.id);
          if (!res.ok) failed.push(row.key);
        }
        setBulkBusy(false);
        if (failed.length > 0) {
          throw new Error(`Deleted ${selected.length - failed.length} of ${selected.length}.`);
        }
        table.resetRowSelection();
        router.refresh();
      }
    );
  }

  const columns = React.useMemo<ColumnDef<TemplateHubRow>[]>(
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
            aria-label={`Select ${row.original.name}`}
          />
        ),
        enableSorting: false,
        enableHiding: false
      },
      {
        accessorKey: "name",
        meta: { viewLabel: "Name" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Template name" />,
        cell: ({ row }) => (
          <Link href={row.original.editHref} className="line-clamp-2 font-medium hover:underline">
            {row.original.name}
          </Link>
        ),
        filterFn: (row, _id, value) => {
          const q = String(value).toLowerCase();
          if (!q) return true;
          const r = row.original;
          const stage = templateStageBadgeDisplay(r.stage);
          const type = templateTypeBadgeDisplay(r.typeLabel);
          const hay = [
            r.name,
            r.description ?? "",
            r.agreementTitle ?? "",
            type.label,
            stage.label,
            formatLastEditedInLocality(r.lastEditedMs, localityTimeZone)
          ]
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        }
      },
      {
        accessorKey: "typeLabel",
        meta: { viewLabel: "Type" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => {
          const d = templateTypeBadgeDisplay(row.original.typeLabel);
          return <StatusBadge label={d.label} variant={d.variant} />;
        },
        filterFn: (row, id, value) => (value as string[]).includes(row.getValue(id))
      },
      {
        accessorKey: "stage",
        meta: { viewLabel: "Stage" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Stage" />,
        cell: ({ row }) => {
          const d = templateStageBadgeDisplay(row.original.stage);
          return (
            <StatusBadge
              label={d.label}
              variant={d.variant}
              title={templateStageBadgeTitle(row.original.stage)}
            />
          );
        },
        filterFn: (row, id, value) => (value as string[]).includes(row.getValue(id))
      },
      {
        accessorKey: "lastEditedMs",
        meta: { viewLabel: "Last Edited" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Last edited" />,
        cell: ({ row }) => (
          <time
            className="text-muted-foreground tabular-nums"
            dateTime={
              row.original.lastEditedMs > 0
                ? new Date(row.original.lastEditedMs).toISOString()
                : undefined
            }>
            {formatLastEditedInLocality(row.original.lastEditedMs, localityTimeZone)}
          </time>
        )
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const template = row.original;
          const rowDisabled = pendingKey === template.key || bulkBusy;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={rowDisabled}
                  aria-label={`Actions for ${template.name}`}>
                  {rowDisabled ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={template.editHref}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={template.previewHref} target="_blank" rel="noopener noreferrer">
                    Preview
                  </Link>
                </DropdownMenuItem>
                {template.stage === "draft" ? (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    disabled={rowDisabled}
                    onSelect={() => void updateStage(template, "published")}>
                    Publish
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    disabled={rowDisabled}
                    onSelect={() => void updateStage(template, "draft")}>
                    Mark as draft
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="cursor-pointer"
                  disabled={rowDisabled}
                  onSelect={() => void cloneRow(template)}>
                  <Copy />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  disabled={rowDisabled}
                  onSelect={() => requestDelete(template)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false
      }
    ],
    [bulkBusy, localityTimeZone, pendingKey]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        initialPageSize={50}
        initialSorting={[{ id: "lastEditedMs", desc: true }]}
        emptyMessage={
          rows.length === 0 ? (
            <Empty className="border-0 py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LayoutTemplate />
                </EmptyMedia>
                <EmptyTitle>No templates yet</EmptyTitle>
                <EmptyDescription>
                  Use New template or New contract template to create reusable content for proposals
                  and agreements.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            "No templates match your filters."
          )
        }
        toolbar={(table) => {
          tableRef.current = table;
          return (
            <TemplatesToolbar
              table={table}
              onBulkDelete={handleBulkDelete}
              bulkDeleteDisabled={bulkBusy || pendingKey !== null}
            />
          );
        }}
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmMeta.title}
        description={confirmMeta.description}
        confirmLabel="Delete"
        destructive={confirmMeta.destructive}
        onConfirm={async () => {
          if (!confirmAction) return;
          await confirmAction();
        }}
      />
    </>
  );
}
