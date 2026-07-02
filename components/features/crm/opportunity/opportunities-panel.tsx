"use client";

import * as React from "react";
import { LayoutGrid, List } from "lucide-react";

import { OpportunitiesBoard } from "@/components/features/crm/opportunity/opportunities-board";
import { OpportunitiesListTable } from "@/components/features/crm/opportunity/opportunities-list-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OpportunityBoardCard } from "@/types/opportunity";

export interface OpportunitiesPanelProps {
  opportunities: OpportunityBoardCard[];
}

export function OpportunitiesPanel({ opportunities }: OpportunitiesPanelProps) {
  const [mode, setMode] = React.useState<"board" | "list">("board");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline"
        description="Drag cards between stages or use the list view to change the stage from the dropdown."
        actions={
          <div className="flex rounded-lg border border-border/80 bg-muted/30 p-0.5">
            <Button
              type="button"
              variant={mode === "board" ? "secondary" : "ghost"}
              size="sm"
              className={cn("gap-1.5", mode === "board" && "shadow-sm")}
              onClick={() => setMode("board")}>
              <LayoutGrid className="h-4 w-4" aria-hidden />
              Board
            </Button>
            <Button
              type="button"
              variant={mode === "list" ? "secondary" : "ghost"}
              size="sm"
              className={cn("gap-1.5", mode === "list" && "shadow-sm")}
              onClick={() => setMode("list")}>
              <List className="h-4 w-4" aria-hidden />
              List
            </Button>
          </div>
        }
      />

      {mode === "board" ? (
        <OpportunitiesBoard opportunities={opportunities} />
      ) : (
        <OpportunitiesListTable opportunities={opportunities} />
      )}
    </div>
  );
}
