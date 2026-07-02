"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";

import { OpportunityKanbanCard } from "@/components/features/crm/opportunity/opportunity-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as Kanban from "@/components/ui/kanban";
import {
  OPPORTUNITY_STAGES,
  opportunityStageLabel
} from "@/lib/crm/opportunity-stages";
import { buildKanbanColumns, detectCrossColumnMove } from "@/lib/kanban/column-state";
import { useOpportunityStageMutation } from "@/hooks/use-opportunity-stage-mutation";
import type { OpportunityBoardCard, OpportunityStage } from "@/types/opportunity";

function groupOpportunitiesByStage(
  opportunities: OpportunityBoardCard[]
): Record<OpportunityStage, OpportunityBoardCard[]> {
  return buildKanbanColumns(OPPORTUNITY_STAGES, opportunities, (o) => o.stage) as Record<
    OpportunityStage,
    OpportunityBoardCard[]
  >;
}

export interface OpportunitiesBoardProps {
  opportunities: OpportunityBoardCard[];
}

export function OpportunitiesBoard({ opportunities }: OpportunitiesBoardProps) {
  const { moveStage, pendingId } = useOpportunityStageMutation();

  const serverColumns = React.useMemo(() => groupOpportunitiesByStage(opportunities), [opportunities]);
  const [columns, setColumns] = React.useState(serverColumns);
  const dragPersistedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    setColumns(serverColumns);
  }, [serverColumns]);

  const handleValueChange = React.useCallback(
    (next: Record<OpportunityStage, OpportunityBoardCard[]>) => {
      const moved = detectCrossColumnMove(columns, next, (o) => o.id);
      setColumns(next as Record<OpportunityStage, OpportunityBoardCard[]>);
      if (moved && dragPersistedRef.current !== moved.id) {
        dragPersistedRef.current = moved.id;
        void moveStage(moved.id, moved.newColumn as OpportunityStage);
      }
    },
    [columns, moveStage]
  );

  function handleDragStart() {
    dragPersistedRef.current = null;
  }

  function handleDragCancel() {
    dragPersistedRef.current = null;
  }

  return (
    <Kanban.Root
      value={columns}
      onValueChange={handleValueChange}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      getItemValue={(item) => item.id}>
      <Kanban.Board className="flex w-full gap-4 overflow-x-auto pb-4">
        {OPPORTUNITY_STAGES.map((stage) => {
          const stageDeals = columns[stage] ?? [];
          return (
            <Kanban.Column key={stage} value={stage} className="w-[340px] min-w-[340px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{opportunityStageLabel(stage)}</span>
                  <Badge variant="outline">{stageDeals.length}</Badge>
                </div>
                <Kanban.ColumnHandle asChild>
                  <Button variant="ghost" size="icon" aria-label={`Reorder ${opportunityStageLabel(stage)} column`}>
                    <GripVertical className="h-4 w-4" />
                  </Button>
                </Kanban.ColumnHandle>
              </div>
              {stageDeals.length > 0 ? (
                <div className="flex flex-col gap-2 p-0.5">
                  {stageDeals.map((opp) => (
                    <OpportunityKanbanCard
                      key={opp.id}
                      opp={opp}
                      disabled={pendingId === opp.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground pt-4 text-sm">No deals in this stage.</div>
              )}
            </Kanban.Column>
          );
        })}
      </Kanban.Board>
      <Kanban.Overlay>
        <div className="bg-primary/10 size-full rounded-md" />
      </Kanban.Overlay>
    </Kanban.Root>
  );
}

export { groupOpportunitiesByStage };
