"use client";

import type * as React from "react";
import type { ColumnsBlock } from "@/types/proposal";
import {
  PROPOSAL_COLUMNS_GRID_CLASS,
  columnFlexToGridTemplate,
  coerceColumnFlex,
  columnsBlockMdGapX,
  columnsBlockMdItemsClass,
} from "@/lib/proposal/columns";
import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";
import { PROPOSAL_DOCUMENT_COLUMNS_ROW_GAP_CLASSES } from "@/lib/proposal/public/public-layout";
import { cn } from "@/lib/utils";

export function renderColumnsBlock({ block, renderBlock }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "columns") return null;
  const columnsBlock = block as ColumnsBlock;
  const stacks = columnsBlock.stacks?.length ? columnsBlock.stacks : [[], []];
  const colCount = stacks.length;
  const flexRow = coerceColumnFlex(colCount, columnsBlock.columnFlex);
  const gapX = columnsBlockMdGapX(columnsBlock.columnGap, colCount);
  const itemsClass = columnsBlockMdItemsClass(columnsBlock.rowAlign);
  const pad =
    typeof columnsBlock.insetPaddingPx === "number" && Number.isFinite(columnsBlock.insetPaddingPx)
      ? Math.min(64, Math.max(0, Math.round(columnsBlock.insetPaddingPx)))
      : 0;
  const grid = (
    <div
      className={cn(PROPOSAL_COLUMNS_GRID_CLASS, PROPOSAL_DOCUMENT_COLUMNS_ROW_GAP_CLASSES, gapX, itemsClass)}
      style={
        {
          ["--proposal-cols" as string]: columnFlexToGridTemplate(flexRow),
        } as React.CSSProperties
      }
    >
      {stacks.map((stack, colIdx) => (
        <div key={colIdx} className="flex min-w-0 flex-col">
          {stack.map((c) => renderBlock(c))}
        </div>
      ))}
    </div>
  );
  if (pad <= 0) return grid;
  return (
    <div className="rounded-lg" style={{ padding: pad }}>
      {grid}
    </div>
  );
}
