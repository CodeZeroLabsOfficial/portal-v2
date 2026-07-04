"use client";

import { Clock, MessageSquare, StickyNote } from "lucide-react";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { Badge } from "@/components/ui/badge";
import type { OpportunityNoteRecord } from "@/types/opportunity";

export interface OpportunityNotesListProps {
  notes: OpportunityNoteRecord[];
}

export function OpportunityNotesList({ notes }: OpportunityNotesListProps) {
  if (notes.length === 0) {
    return (
      <CustomerTabEmptyState icon={MessageSquare} embedded>
        <p>Nothing logged yet.</p>
        <p>Add a note using the button above.</p>
      </CustomerTabEmptyState>
    );
  }

  return (
    <ul className="space-y-3">
      {notes.map((note) => (
        <li key={note.id} className="rounded-lg border border-border/70 bg-muted/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="outline" className="gap-1.5 font-normal">
              <StickyNote className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Note
            </Badge>
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
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{note.body}</p>
        </li>
      ))}
    </ul>
  );
}
