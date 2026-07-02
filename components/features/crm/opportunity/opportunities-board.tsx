"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from "@dnd-kit/core";

import { OpportunityCard, formatOpportunityCardDate } from "@/components/features/crm/opportunity/opportunity-card";
import {
  OPPORTUNITY_STAGES,
  isOpportunityStage,
  opportunityStageLabel
} from "@/lib/crm/opportunity-stages";
import { cn } from "@/lib/utils";
import { useOpportunityStageMutation } from "@/hooks/use-opportunity-stage-mutation";
import type { OpportunityBoardCard, OpportunityStage } from "@/types/opportunity";

function StageColumn({
  stage,
  children,
  count
}: {
  stage: OpportunityStage;
  children: React.ReactNode;
  count: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[420px] min-w-[260px] flex-1 flex-col rounded-xl border bg-muted/20",
        isOver ? "border-primary/60 ring-1 ring-primary/30" : "border-border/70"
      )}>
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
        <span className="text-[13px] font-semibold text-foreground">{opportunityStageLabel(stage)}</span>
        <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium tabular-nums text-primary-foreground">
          {count}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">{children}</div>
    </div>
  );
}

export interface OpportunitiesBoardProps {
  opportunities: OpportunityBoardCard[];
}

export function OpportunitiesBoard({ opportunities }: OpportunitiesBoardProps) {
  const { moveStage, pendingId } = useOpportunityStageMutation();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    })
  );

  const byStage = React.useMemo(() => {
    const map = new Map<OpportunityStage, OpportunityBoardCard[]>();
    for (const s of OPPORTUNITY_STAGES) {
      map.set(s, []);
    }
    for (const o of opportunities) {
      const list = map.get(o.stage);
      if (list) list.push(o);
      else map.get("lead_in")!.push(o);
    }
    return map;
  }, [opportunities]);

  const activeOpp = activeId ? opportunities.find((o) => o.id === activeId) : undefined;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const oid = String(event.active.id);
    setActiveId(null);
    const overId = event.over?.id;
    if (!overId) return;
    const opp = opportunities.find((o) => o.id === oid);
    if (!opp) return;
    const nextStage = String(overId);
    if (!isOpportunityStage(nextStage)) return;
    if (nextStage === opp.stage) return;
    void moveStage(oid, nextStage);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {OPPORTUNITY_STAGES.map((stage) => {
          const list = byStage.get(stage) ?? [];
          return (
            <StageColumn key={stage} stage={stage} count={list.length}>
              {list.map((opp) => (
                <OpportunityCard key={opp.id} opp={opp} disabled={pendingId === opp.id} />
              ))}
            </StageColumn>
          );
        })}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeOpp ? (
          <div className="pointer-events-none min-w-[240px] max-w-[280px] rounded-xl border border-border bg-card p-3 shadow-lg">
            <p className="text-[13px] font-semibold text-foreground">{activeOpp.name}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{activeOpp.leadContactName}</p>
            <div className="mt-1.5 space-y-0.5 text-[11px] leading-snug text-muted-foreground">
              <p>Created: {formatOpportunityCardDate(activeOpp.createdAt)}</p>
              <p>Last update: {formatOpportunityCardDate(activeOpp.updatedAt)}</p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
