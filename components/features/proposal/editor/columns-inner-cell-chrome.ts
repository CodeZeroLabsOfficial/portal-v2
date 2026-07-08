"use client";

import * as React from "react";

export function useColumnsInnerCellChrome() {
  const [activeByBlockId, setActiveByBlockId] = React.useState<Record<string, string>>({});
  const clearRef = React.useRef<Record<string, () => void>>({});

  const reportInnerCell = React.useCallback((blockId: string, cellId: string | null) => {
    setActiveByBlockId((prev) => {
      if (!cellId) {
        if (!(blockId in prev)) return prev;
        const next = { ...prev };
        delete next[blockId];
        return next;
      }
      return { ...prev, [blockId]: cellId };
    });
  }, []);

  const registerClear = React.useCallback((blockId: string, clear: (() => void) | null) => {
    if (clear) clearRef.current[blockId] = clear;
    else delete clearRef.current[blockId];
  }, []);

  const clearBlockShellSelection = React.useCallback(
    (blockId: string) => {
      clearRef.current[blockId]?.();
      reportInnerCell(blockId, null);
    },
    [reportInnerCell],
  );

  const isInnerCellActive = React.useCallback(
    (blockId: string) => Boolean(activeByBlockId[blockId]),
    [activeByBlockId],
  );

  const callbacksFor = React.useCallback(
    (blockId: string) => ({
      onInnerCellActiveChange: (cellId: string | null) => reportInnerCell(blockId, cellId),
      registerClearCellSelection: (clear: (() => void) | null) => registerClear(blockId, clear),
    }),
    [reportInnerCell, registerClear],
  );

  return { isInnerCellActive, clearBlockShellSelection, callbacksFor };
}
