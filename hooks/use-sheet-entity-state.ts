import * as React from "react";

import { SHEET_ANIMATION_MS } from "@/lib/sheet/animation";

export interface UseSheetEntityStateResult<T> {
  open: boolean;
  entity: T | null;
  show: (entity: T) => void;
  onOpenChange: (open: boolean) => void;
  clear: () => void;
}

/** Keeps sheet payload mounted through the close animation before unmounting. */
export function useSheetEntityState<T>(): UseSheetEntityStateResult<T> {
  const [open, setOpen] = React.useState(false);
  const [entity, setEntity] = React.useState<T | null>(null);
  const clearTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClearTimer = React.useCallback(() => {
    if (clearTimerRef.current !== null) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => () => cancelClearTimer(), [cancelClearTimer]);

  const clear = React.useCallback(() => {
    cancelClearTimer();
    setOpen(false);
    setEntity(null);
  }, [cancelClearTimer]);

  const show = React.useCallback(
    (next: T) => {
      cancelClearTimer();
      setEntity(next);
      setOpen(true);
    },
    [cancelClearTimer],
  );

  const onOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        cancelClearTimer();
        setOpen(true);
        return;
      }
      setOpen(false);
      cancelClearTimer();
      clearTimerRef.current = setTimeout(() => {
        setEntity(null);
        clearTimerRef.current = null;
      }, SHEET_ANIMATION_MS);
    },
    [cancelClearTimer],
  );

  return { open, entity, show, onOpenChange, clear };
}
