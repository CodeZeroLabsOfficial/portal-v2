"use client";

import * as React from "react";

import { AddOpportunityNoteDialog } from "@/components/features/crm/opportunity/add-opportunity-note-dialog";
import { OpportunityNotesList } from "@/components/features/crm/opportunity/opportunity-notes-list";
import { CrmNotesPanelShell } from "@/components/shared/crm-notes-panel-shell";
import type { OpportunityNoteRecord } from "@/types/opportunity";

export interface OpportunityNotesPanelProps {
  opportunityId: string;
  notes: OpportunityNoteRecord[];
}

export function OpportunityNotesPanel({ opportunityId, notes }: OpportunityNotesPanelProps) {
  const sortedNotes = React.useMemo(
    () => [...notes].sort((a, b) => b.createdAt - a.createdAt),
    [notes]
  );

  return (
    <CrmNotesPanelShell title="Notes" action={<AddOpportunityNoteDialog opportunityId={opportunityId} />}>
      <OpportunityNotesList notes={sortedNotes} />
    </CrmNotesPanelShell>
  );
}
