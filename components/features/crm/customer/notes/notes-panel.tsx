"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { AddCustomerNoteDialog } from "@/components/features/crm/customer/notes/add-customer-note-dialog";
import { CustomerNotesList } from "@/components/features/crm/customer/notes/customer-notes-list";
import { CrmNotesPanelShell } from "@/components/shared/crm-notes-panel-shell";
import { FilterPillGroup } from "@/components/shared/filter-pill-group";
import { Input } from "@/components/ui/input";
import {
  CUSTOMER_NOTE_FILTERS,
  filterCustomerNotes,
  type CustomerNoteFilter
} from "@/lib/crm/customer-notes";
import type { CustomerNoteRecord } from "@/types/customer";

export interface CustomerNotesPanelProps {
  customerId: string;
  notes: CustomerNoteRecord[];
}

export function CustomerNotesPanel({ customerId, notes }: CustomerNotesPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filter, setFilter] = React.useState<CustomerNoteFilter>("all");

  const filteredNotes = React.useMemo(
    () => filterCustomerNotes(notes, filter, searchQuery),
    [notes, filter, searchQuery]
  );

  function clearFilters() {
    setSearchQuery("");
    setFilter("all");
  }

  return (
    <CrmNotesPanelShell
      title="Notes"
      action={<AddCustomerNoteDialog customerId={customerId} />}
      toolbar={
        <>
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
          <FilterPillGroup
            options={CUSTOMER_NOTE_FILTERS.map(({ value, label }) => ({ value, label }))}
            value={filter}
            onChange={setFilter}
            className="min-w-0 sm:ms-auto"
          />
        </>
      }>
      <CustomerNotesList
        notes={filteredNotes}
        hasAnyNotes={notes.length > 0}
        searchQuery={searchQuery}
        onClearFilters={clearFilters}
      />
    </CrmNotesPanelShell>
  );
}
