"use client";

import * as React from "react";
import { LayoutTemplate } from "lucide-react";

import { TemplateCard } from "@/components/features/templates/template-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useTemplateRowActions } from "@/hooks/use-template-row-actions";
import { filterTemplateHubRows } from "@/lib/templates/filter-hub-rows";
import type { TemplateHubRow, TemplateHubTab } from "@/lib/templates/hub-rows";

export interface TemplatesGridProps {
  rows: TemplateHubRow[];
  activeTab: TemplateHubTab;
  searchQuery: string;
  localityTimeZone?: string;
}

function emptyTabDescription(activeTab: TemplateHubTab): string {
  if (activeTab === "all") {
    return "Use New Template to create proposal or contract templates.";
  }
  if (activeTab === "proposal") {
    return "Use New Template to create reusable content for proposals.";
  }
  return "Use New Template to create reusable agreement copy.";
}

export function TemplatesGrid({
  rows,
  activeTab,
  searchQuery,
  localityTimeZone,
}: TemplatesGridProps) {
  const {
    pendingKey,
    confirmOpen,
    setConfirmOpen,
    confirmMeta,
    confirmAction,
    updateStage,
    cloneRow,
    requestDelete,
  } = useTemplateRowActions();

  const filteredRows = React.useMemo(
    () => filterTemplateHubRows(rows, { tab: activeTab, searchQuery, localityTimeZone }),
    [rows, activeTab, searchQuery, localityTimeZone]
  );

  const tabRows = React.useMemo(
    () => (activeTab === "all" ? rows : rows.filter((row) => row.kind === activeTab)),
    [rows, activeTab]
  );
  const total = filteredRows.length;
  const from = total === 0 ? 0 : 1;
  const to = total;

  if (filteredRows.length === 0) {
    const isEmptyTab = tabRows.length === 0;
    return (
      <>
        <Empty className="border py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutTemplate />
            </EmptyMedia>
            <EmptyTitle>{isEmptyTab ? "No templates yet" : "No templates found"}</EmptyTitle>
            <EmptyDescription>
              {isEmptyTab ? emptyTabDescription(activeTab) : "Try a different search term."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
        <TemplateConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          meta={confirmMeta}
          onConfirm={confirmAction}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredRows.map((row) => (
          <TemplateCard
            key={row.key}
            row={row}
            disabled={pendingKey === row.key}
            onUpdateStage={(r, stage) => void updateStage(r, stage)}
            onClone={(r) => void cloneRow(r)}
            onRequestDelete={requestDelete}
          />
        ))}
      </div>

      <p className="text-muted-foreground text-sm">
        Showing {from} to {to} of {total} {total === 1 ? "template" : "templates"}
      </p>

      <TemplateConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        meta={confirmMeta}
        onConfirm={confirmAction}
      />
    </>
  );
}

interface TemplateConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta: { title: string; description: string; destructive: boolean };
  onConfirm: (() => Promise<void>) | null;
}

function TemplateConfirmDialog({ open, onOpenChange, meta, onConfirm }: TemplateConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={meta.title}
      description={meta.description}
      confirmLabel="Delete"
      destructive={meta.destructive}
      onConfirm={async () => {
        if (!onConfirm) return;
        await onConfirm();
      }}
    />
  );
}
