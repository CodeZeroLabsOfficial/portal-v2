import type { CustomerActivityRecord, CustomerNoteKind, CustomerNoteRecord } from "@/types/customer";

export type CustomerTimelineFilter = "all" | CustomerNoteKind | "system";

export type CustomerTimelineItemSource = "note" | "activity";

export interface CustomerTimelineItem {
  id: string;
  source: CustomerTimelineItemSource;
  createdAt: number;
  title: string;
  body?: string;
  noteKind?: CustomerNoteKind;
  activityType?: CustomerActivityRecord["type"];
  filterCategory: CustomerTimelineFilter;
}

const NOTE_KIND_LABEL: Record<CustomerNoteKind, string> = {
  note: "Note",
  call: "Call logged",
  email: "Email logged",
};

/** Manual notes become timeline rows; `note` activities are skipped to avoid duplicates. */
export function buildCustomerTimelineItems(
  notes: CustomerNoteRecord[],
  activities: CustomerActivityRecord[],
): CustomerTimelineItem[] {
  const noteItems: CustomerTimelineItem[] = notes.map((note) => ({
    id: `note-${note.id}`,
    source: "note",
    createdAt: note.createdAt,
    title: NOTE_KIND_LABEL[note.kind],
    body: note.body,
    noteKind: note.kind,
    filterCategory: note.kind,
  }));

  const activityItems: CustomerTimelineItem[] = activities
    .filter((activity) => activity.type !== "note")
    .map((activity) => ({
      id: `activity-${activity.id}`,
      source: "activity",
      createdAt: activity.createdAt,
      title: activity.title,
      body: activity.detail,
      activityType: activity.type,
      filterCategory: "system",
    }));

  return [...noteItems, ...activityItems].sort((a, b) => b.createdAt - a.createdAt);
}

export function filterCustomerTimelineItems(
  items: CustomerTimelineItem[],
  filter: CustomerTimelineFilter,
  searchQuery: string,
): CustomerTimelineItem[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return items.filter((item) => {
    if (filter !== "all" && item.filterCategory !== filter) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    const haystack = [item.title, item.body ?? ""].join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export const CUSTOMER_TIMELINE_FILTERS: { value: CustomerTimelineFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "note", label: "Notes" },
  { value: "call", label: "Calls" },
  { value: "email", label: "Emails" },
  { value: "system", label: "System" },
];
