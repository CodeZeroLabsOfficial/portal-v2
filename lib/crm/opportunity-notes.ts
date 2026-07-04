import type { OpportunityNoteRecord } from "@/types/opportunity";

export function filterOpportunityNotes(
  notes: OpportunityNoteRecord[],
  searchQuery: string
): OpportunityNoteRecord[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return notes;
  }
  return notes.filter((note) => note.body.toLowerCase().includes(query));
}
