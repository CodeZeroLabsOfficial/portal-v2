import { noteBodyPlainText } from "@/lib/crm/customer-note-body";
import type { CustomerNoteKind, CustomerNoteRecord } from "@/types/customer";

export type CustomerNoteFilter = "all" | CustomerNoteKind;

export function sortCustomerNotes(notes: CustomerNoteRecord[]): CustomerNoteRecord[] {
  return [...notes].sort((a, b) => b.createdAt - a.createdAt);
}

export function filterCustomerNotes(
  notes: CustomerNoteRecord[],
  filter: CustomerNoteFilter,
  searchQuery: string,
): CustomerNoteRecord[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return sortCustomerNotes(notes).filter((note) => {
    if (filter !== "all" && note.kind !== filter) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    const haystack = [note.title ?? "", noteBodyPlainText(note.body, note.bodyFormat)]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export const CUSTOMER_NOTE_FILTERS: { value: CustomerNoteFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "note", label: "Notes" },
  { value: "call", label: "Calls" },
  { value: "email", label: "Emails" },
];
