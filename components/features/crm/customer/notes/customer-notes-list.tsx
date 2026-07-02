"use client";

import { Clock, FileSearchIcon, MessageSquare } from "lucide-react";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { customerNoteKindMeta } from "@/lib/crm/customer-note-display";
import { sanitizeProposalHtml } from "@/lib/proposal/sanitize";
import { cn } from "@/lib/utils";
import type { CustomerNoteRecord } from "@/types/customer";

export interface CustomerNotesListProps {
  notes: CustomerNoteRecord[];
  hasAnyNotes: boolean;
  searchQuery: string;
  onClearFilters: () => void;
}

export function CustomerNotesList({
  notes,
  hasAnyNotes,
  searchQuery,
  onClearFilters
}: CustomerNotesListProps) {
  if (!hasAnyNotes) {
    return (
      <CustomerTabEmptyState icon={MessageSquare} embedded>
        <p>Nothing logged yet.</p>
        <p>Add a note, call, or email log using the button above.</p>
      </CustomerTabEmptyState>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted/30 mb-4 rounded-full p-6">
          <FileSearchIcon className="text-muted-foreground h-10 w-10" aria-hidden />
        </div>
        <h3 className="mb-2 text-lg font-medium">No matching notes</h3>
        <p className="text-muted-foreground max-w-md text-sm">
          {searchQuery.trim()
            ? `Nothing matches "${searchQuery.trim()}".`
            : "Nothing matches the selected filter."}
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {notes.map((note) => {
        const { icon: Icon, badge } = customerNoteKindMeta(note.kind);
        const isHtml = note.bodyFormat === "html";

        return (
          <li key={note.id} className="rounded-lg border border-border/70 bg-muted/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                <Icon className="text-muted-foreground h-3.5 w-3.5 shrink-0" aria-hidden />
                <StatusBadge label={badge.label} variant={badge.variant} />
              </span>
              <time
                dateTime={new Date(note.createdAt).toISOString()}
                className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Clock className="size-3" aria-hidden />
                {new Date(note.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}
              </time>
            </div>
            {note.title ? (
              <p className="mt-2 text-sm font-medium text-foreground">{note.title}</p>
            ) : null}
            {isHtml ? (
              <div
                className={cn(
                  "crm-note-rich-text mt-2 max-w-none text-sm text-foreground",
                  "[&_a]:text-primary [&_a]:underline [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:my-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-5"
                )}
                dangerouslySetInnerHTML={{ __html: sanitizeProposalHtml(note.body) }}
              />
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{note.body}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
