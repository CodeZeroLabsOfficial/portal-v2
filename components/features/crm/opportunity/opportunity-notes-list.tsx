"use client";

import { MessageSquare } from "lucide-react";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { Badge } from "@/components/ui/badge";
import { customerNoteKindMeta } from "@/lib/crm/customer-note-display";
import { sanitizeProposalHtml } from "@/lib/proposal/sanitize";
import { cn } from "@/lib/utils";
import type { CustomerNoteKind } from "@/types/customer";
import type { OpportunityNoteRecord } from "@/types/opportunity";

export interface OpportunityNotesListProps {
  notes: OpportunityNoteRecord[];
}

export function OpportunityNotesList({ notes }: OpportunityNotesListProps) {
  if (notes.length === 0) {
    return (
      <CustomerTabEmptyState icon={MessageSquare} embedded>
        <p>Nothing logged yet.</p>
        <p>Add a note, call, or email log using the button above.</p>
      </CustomerTabEmptyState>
    );
  }

  return (
    <ul className="space-y-3">
      {notes.map((note) => {
        const { label, icon: Icon } = customerNoteKindMeta(note.kind as CustomerNoteKind);
        const isHtml = note.bodyFormat === "html";

        return (
          <li key={note.id} className="rounded-lg border border-border/70 bg-muted/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <Badge variant="outline" className="shrink-0 gap-1.5 font-normal">
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {label}
                </Badge>
                {note.title ? (
                  <span className="text-sm font-medium text-foreground">{note.title}</span>
                ) : null}
              </div>
              <time
                dateTime={new Date(note.createdAt).toISOString()}
                className="text-muted-foreground shrink-0 text-xs whitespace-nowrap">
                {new Date(note.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}
              </time>
            </div>
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
