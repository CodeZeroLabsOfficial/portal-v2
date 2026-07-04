"use client";

import { Clock, FileSearchIcon, MessageSquare, StickyNote } from "lucide-react";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OpportunityNoteRecord } from "@/types/opportunity";

export interface OpportunityNotesListProps {
  notes: OpportunityNoteRecord[];
  hasAnyNotes: boolean;
  searchQuery: string;
  onClearSearch: () => void;
}

export function OpportunityNotesList({
  notes,
  hasAnyNotes,
  searchQuery,
  onClearSearch
}: OpportunityNotesListProps) {
  if (!hasAnyNotes) {
    return (
      <CustomerTabEmptyState icon={MessageSquare} embedded>
        <p>Nothing logged yet.</p>
        <p>Add a note using the button above.</p>
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
            : "Nothing matches your search."}
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onClearSearch}>
          Clear search
        </Button>
      </div>
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
