"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { AddCustomerNoteDialog } from "@/components/features/crm/customer/notes/add-customer-note-dialog";
import { CustomerNotesList } from "@/components/features/crm/customer/notes/customer-notes-list";
import { FilterPillGroup } from "@/components/shared/filter-pill-group";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
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
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <Typography variant="h3" className="text-base">
          Notes
        </Typography>
        <AddCustomerNoteDialog customerId={customerId} />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-4 sm:px-5">
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
      </div>

      <div className="bg-card px-4 py-5 sm:px-5">
        <CustomerNotesList
          notes={filteredNotes}
          hasAnyNotes={notes.length > 0}
          searchQuery={searchQuery}
          onClearFilters={clearFilters}
        />
      </div>
    </div>
  );
}
