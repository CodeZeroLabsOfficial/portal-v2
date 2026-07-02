"use client";

import { Clock, FileSearchIcon } from "lucide-react";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { customerActivityIcon } from "@/lib/crm/customer-activity-display";
import { customerNoteKindMeta } from "@/lib/crm/customer-note-display";
import type { CustomerTimelineItem } from "@/lib/crm/customer-note-timeline";

export interface CustomerNoteTimelineProps {
  items: CustomerTimelineItem[];
  hasAnyItems: boolean;
  searchQuery: string;
  onClearSearch: () => void;
}

export function CustomerNoteTimeline({
  items,
  hasAnyItems,
  searchQuery,
  onClearSearch
}: CustomerNoteTimelineProps) {
  if (!hasAnyItems) {
    return (
      <CustomerTabEmptyState icon={Clock} embedded>
        <p>Nothing logged yet.</p>
        <p>Notes, calls, emails, and system events will appear here as they happen.</p>
      </CustomerTabEmptyState>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted/30 mb-4 rounded-full p-6">
          <FileSearchIcon className="text-muted-foreground h-10 w-10" aria-hidden />
        </div>
        <h3 className="mb-2 text-lg font-medium">No matching entries</h3>
        <p className="text-muted-foreground max-w-md text-sm">
          {searchQuery.trim()
            ? `Nothing matches "${searchQuery.trim()}".`
            : "Nothing matches the selected filter."}
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onClearSearch}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const Icon =
          item.source === "note" && item.noteKind
            ? customerNoteKindMeta(item.noteKind).icon
            : customerActivityIcon(item.activityType ?? "other");
        const badge =
          item.source === "note" && item.noteKind
            ? customerNoteKindMeta(item.noteKind).badge
            : { label: "System", variant: "outline" as const };

        return (
          <li key={item.id} className="rounded-lg border border-border/70 bg-muted/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                <Icon className="text-muted-foreground h-3.5 w-3.5 shrink-0" aria-hidden />
                {item.title}
                <StatusBadge label={badge.label} variant={badge.variant} className="ms-1" />
              </span>
              <time
                dateTime={new Date(item.createdAt).toISOString()}
                className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Clock className="size-3" aria-hidden />
                {new Date(item.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}
              </time>
            </div>
            {item.body ? (
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{item.body}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
