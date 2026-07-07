"use client";

import * as React from "react";
import { LayoutTemplate, Loader2, Search } from "lucide-react";
import Link from "next/link";

import { ContractTemplatePickerCard } from "@/components/features/templates/contract-template-picker-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
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
  const [query, setQuery] = React.useState("");
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
    setQuery("");
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

  const visible = React.useMemo(() => filterContractTemplatePickerRows(rows, query), [rows, query]);
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
        className="flex max-h-[85dvh] max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl"
        aria-busy={pendingTemplateId !== null}
      >
        <DialogHeader className="shrink-0 space-y-2 border-b px-6 py-5 text-left">
          <DialogTitle>Choose contract template</DialogTitle>
          <DialogDescription>
            Published templates only. Selecting one copies agreement text onto this Accept block so proposals stay
            stable when templates change later.
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 px-6 py-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search contract templates…"
              className="h-10 pl-9"
              aria-label="Search contract templates"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

        <div className="flex shrink-0 flex-col gap-3 border-t px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            {total > 0 ? (
              <>
                Showing {from} to {to} of {total} {total === 1 ? "template" : "templates"}
              </>
            ) : (
              "No templates to show"
            )}
          </p>
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link href="/admin/templates">Manage contract templates</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
