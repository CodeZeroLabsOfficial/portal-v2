"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { AddOpportunityNoteDialog } from "@/components/features/crm/opportunity/add-opportunity-note-dialog";
import { OpportunityNotesList } from "@/components/features/crm/opportunity/opportunity-notes-list";
import { CrmNotesPanelShell } from "@/components/shared/crm-notes-panel-shell";
import { Input } from "@/components/ui/input";
import { filterOpportunityNotes } from "@/lib/crm/opportunity-notes";
import type { OpportunityNoteRecord } from "@/types/opportunity";

export interface OpportunityNotesPanelProps {
  opportunityId: string;
  notes: OpportunityNoteRecord[];
}

export function OpportunityNotesPanel({ opportunityId, notes }: OpportunityNotesPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const sortedNotes = React.useMemo(
    () => [...notes].sort((a, b) => b.createdAt - a.createdAt),
    [notes]
  );

  const filteredNotes = React.useMemo(
    () => filterOpportunityNotes(sortedNotes, searchQuery),
    [sortedNotes, searchQuery]
  );

  return (
    <CrmNotesPanelShell
      title="Notes"
      action={<AddOpportunityNoteDialog opportunityId={opportunityId} />}
      toolbar={
        <div className="relative min-w-[10rem] flex-1 sm:max-w-[14rem]">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            className="h-9 pl-9"
            placeholder="Search notes"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search notes"
          />
        </div>
      }>
      <OpportunityNotesList
        notes={filteredNotes}
        hasAnyNotes={notes.length > 0}
        searchQuery={searchQuery}
        onClearSearch={() => setSearchQuery("")}
      />
    </CrmNotesPanelShell>
  );
}
