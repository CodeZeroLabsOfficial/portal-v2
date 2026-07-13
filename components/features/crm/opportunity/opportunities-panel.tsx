"use client";

import * as React from "react";

import { OpportunitiesBoard } from "@/components/features/crm/opportunity/opportunities-board";
import { OpportunitiesListTable } from "@/components/features/crm/opportunity/opportunities-list-table";
import { KanbanBoardToolbar } from "@/components/shared/kanban-board-toolbar";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OpportunityBoardCard } from "@/types/opportunity";

function filterOpportunitiesBySearch(
  opportunities: OpportunityBoardCard[],
  query: string
): OpportunityBoardCard[] {
  const q = query.trim().toLowerCase();
  if (!q) return opportunities;
  return opportunities.filter((o) => {
    const name = o.name.toLowerCase();
    const contact = o.leadContactName.toLowerCase();
    const account = o.accountCompanyName.toLowerCase();
    return name.includes(q) || contact.includes(q) || account.includes(q);
  });
}

export interface OpportunitiesPanelProps {
  opportunities: OpportunityBoardCard[];
}

export function OpportunitiesPanel({ opportunities }: OpportunitiesPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filtered = React.useMemo(
    () => filterOpportunitiesBySearch(opportunities, searchQuery),
    [opportunities, searchQuery]
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pipeline"
        description="Deals by stage across your sales pipeline"
      />

      <Tabs defaultValue="board" className="w-full">
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>

          <KanbanBoardToolbar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            searchPlaceholder="Search deals…"
          />
        </div>

        <TabsContent value="board">
          <OpportunitiesBoard opportunities={filtered} />
        </TabsContent>
        <TabsContent value="list">
          <OpportunitiesListTable opportunities={filtered} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
