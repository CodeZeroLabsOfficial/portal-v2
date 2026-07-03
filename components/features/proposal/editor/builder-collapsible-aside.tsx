"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const BUILDER_ASIDE_HANDLE_CLASS =
  "absolute top-1/2 z-10 flex h-14 w-6 -translate-y-1/2 items-center justify-center border border-border/80 bg-background/95 text-muted-foreground shadow-md backdrop-blur-md transition-colors supports-[backdrop-filter]:bg-background/80 hover:bg-muted/80";

export interface BuilderCollapsibleAsideProps {
  side: "left" | "right";
  label: string;
  storageKey: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function BuilderCollapsibleAside({
  side,
  label,
  storageKey,
  children,
  defaultOpen = true,
}: BuilderCollapsibleAsideProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const hydratedRef = React.useRef(false);

  React.useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === "open") setOpen(true);
      if (stored === "closed") setOpen(false);
    } catch {
      // ignore storage errors
    }
  }, [storageKey]);

  function toggle(next: boolean) {
    setOpen(next);
    try {
      window.localStorage.setItem(storageKey, next ? "open" : "closed");
    } catch {
      // ignore storage errors
    }
  }

  const isLeft = side === "left";

  if (!open) {
    return (
      <div className="relative h-full w-0 shrink-0 overflow-visible">
        <button
          type="button"
          className={cn(
            BUILDER_ASIDE_HANDLE_CLASS,
            isLeft
              ? "left-0 rounded-r-md border-l-0"
              : "right-0 rounded-l-md border-r-0",
          )}
          aria-label={`Expand ${label.toLowerCase()}`}
          onClick={() => toggle(true)}
        >
          {isLeft ? (
            <ChevronRight className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 w-[15%] min-w-[11rem] max-w-[18rem] shrink-0 flex-col overflow-visible",
      )}
    >
      <aside
        aria-label={label}
        className={cn(
          "flex h-full min-h-0 w-full flex-col overflow-hidden border-border/80 bg-background",
          isLeft ? "border-r" : "border-l",
        )}
      >
        {children}
      </aside>
      <button
        type="button"
        className={cn(
          BUILDER_ASIDE_HANDLE_CLASS,
          isLeft ? "-right-3 rounded-r-md border-l-0" : "-left-3 rounded-l-md border-r-0",
        )}
        aria-label={`Collapse ${label.toLowerCase()}`}
        onClick={() => toggle(false)}
      >
        {isLeft ? (
          <ChevronLeft className="h-4 w-4" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
