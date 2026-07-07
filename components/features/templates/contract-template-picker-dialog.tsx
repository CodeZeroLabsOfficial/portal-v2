"use client";

import * as React from "react";
import { LayoutTemplate, Loader2 } from "lucide-react";
import Link from "next/link";

import { ContractTemplatePickerCard } from "@/components/features/templates/contract-template-picker-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { fetchContractTemplatePickerRows } from "@/lib/templates/contract-template-picker-fetch";
import {
  filterContractTemplatePickerRows,
  type ContractTemplatePick,
  type ContractTemplatePickerRow,
} from "@/lib/templates/contract-template-picker";

export interface ContractTemplatePickerDialogProps {
  open: boolean;
  includeContractTemplateId?: string;
  currentContractTemplateId?: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (pick: ContractTemplatePick) => void;
}

export function ContractTemplatePickerDialog({
  open,
  includeContractTemplateId,
  currentContractTemplateId,
  onOpenChange,
  onSelect,
}: ContractTemplatePickerDialogProps) {
  const [rows, setRows] = React.useState<ContractTemplatePickerRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingTemplateId, setPendingTemplateId] = React.useState<string | null>(null);

  const includeId = includeContractTemplateId?.trim() || undefined;

  const loadTemplates = React.useCallback(
    (force?: boolean) => {
      setLoading(true);
      setError(null);
      return fetchContractTemplatePickerRows({ force, includeId })
        .then((templates) => {
          setRows(templates);
          setLoading(false);
        })
        .catch(() => {
          setError("Could not load contract templates");
          setLoading(false);
        });
    },
    [includeId],
  );

  React.useEffect(() => {
    if (!open) {
      setPendingTemplateId(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchContractTemplatePickerRows({ includeId })
      .then((templates) => {
        if (cancelled) return;
        setRows(templates);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load contract templates");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, includeId]);

  const visible = React.useMemo(() => filterContractTemplatePickerRows(rows, ""), [rows]);
  const total = visible.length;
  const from = total === 0 ? 0 : 1;
  const to = total;

  async function handleUseTemplate(row: ContractTemplatePickerRow) {
    if (pendingTemplateId) return;
    setPendingTemplateId(row.id);
    try {
      onSelect({
        id: row.id,
        name: row.name,
        agreementTitle: row.agreementTitle,
        introHtml: row.introHtml ?? "",
        legalHtml: row.legalHtml ?? "",
      });
      onOpenChange(false);
    } catch {
      setPendingTemplateId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[85dvh] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
        aria-busy={pendingTemplateId !== null}
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4 text-left">
          <DialogTitle>Choose contract template</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="size-8 animate-spin" aria-hidden />
              <p className="text-sm">Loading contract templates…</p>
            </div>
          ) : error ? (
            <div className="space-y-3 py-10 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => void loadTemplates(true)}>
                Try again
              </Button>
            </div>
          ) : visible.length === 0 ? (
            <Empty className="border py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LayoutTemplate />
                </EmptyMedia>
                <EmptyTitle>No published contract templates</EmptyTitle>
                <EmptyDescription>
                  Publish a contract template from Templates, then return here to attach it to this Accept block.
                </EmptyDescription>
              </EmptyHeader>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/admin/templates">Open Templates</Link>
              </Button>
            </Empty>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {visible.map((row) => (
                <ContractTemplatePickerCard
                  key={row.id}
                  row={row}
                  isSelected={currentContractTemplateId?.trim() === row.id}
                  isApplying={pendingTemplateId === row.id}
                  disabled={pendingTemplateId !== null && pendingTemplateId !== row.id}
                  onUse={() => void handleUseTemplate(row)}
                />
              ))}
            </div>
          )}
        </div>

        {total > 0 ? (
          <div className="shrink-0 border-t px-6 py-3">
            <p className="text-muted-foreground text-sm">
              Showing {from} to {to} of {total} {total === 1 ? "template" : "templates"}
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
