"use client";

import * as React from "react";

export const BUILDER_OUTLINE_STORAGE_KEY = "proposal_builder_outline_open";
export const BUILDER_INSPECTOR_STORAGE_KEY = "proposal_builder_inspector_open";

interface BuilderSidePanelContextValue {
  outlineOpen: boolean;
  inspectorOpen: boolean;
  setOutlineOpen: (open: boolean) => void;
  setInspectorOpen: (open: boolean) => void;
  toggleOutline: () => void;
  toggleInspector: () => void;
}

const BuilderSidePanelContext = React.createContext<BuilderSidePanelContextValue | null>(null);

function readStoredOpen(storageKey: string, fallback: boolean): boolean {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "open") return true;
    if (stored === "closed") return false;
  } catch {
    // ignore storage errors
  }
  return fallback;
}

function persistOpen(storageKey: string, open: boolean) {
  try {
    window.localStorage.setItem(storageKey, open ? "open" : "closed");
  } catch {
    // ignore storage errors
  }
}

export function BuilderSidePanelProvider({ children }: { children: React.ReactNode }) {
  const [outlineOpen, setOutlineOpenState] = React.useState(true);
  const [inspectorOpen, setInspectorOpenState] = React.useState(true);
  const hydratedRef = React.useRef(false);

  React.useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    setOutlineOpenState(readStoredOpen(BUILDER_OUTLINE_STORAGE_KEY, true));
    setInspectorOpenState(readStoredOpen(BUILDER_INSPECTOR_STORAGE_KEY, true));
  }, []);

  const setOutlineOpen = React.useCallback((open: boolean) => {
    setOutlineOpenState(open);
    persistOpen(BUILDER_OUTLINE_STORAGE_KEY, open);
  }, []);

  const setInspectorOpen = React.useCallback((open: boolean) => {
    setInspectorOpenState(open);
    persistOpen(BUILDER_INSPECTOR_STORAGE_KEY, open);
  }, []);

  const toggleOutline = React.useCallback(() => {
    setOutlineOpenState((prev) => {
      const next = !prev;
      persistOpen(BUILDER_OUTLINE_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const toggleInspector = React.useCallback(() => {
    setInspectorOpenState((prev) => {
      const next = !prev;
      persistOpen(BUILDER_INSPECTOR_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({
      outlineOpen,
      inspectorOpen,
      setOutlineOpen,
      setInspectorOpen,
      toggleOutline,
      toggleInspector,
    }),
    [outlineOpen, inspectorOpen, setOutlineOpen, setInspectorOpen, toggleOutline, toggleInspector],
  );

  return (
    <BuilderSidePanelContext.Provider value={value}>{children}</BuilderSidePanelContext.Provider>
  );
}

export function useBuilderSidePanels(): BuilderSidePanelContextValue {
  const ctx = React.useContext(BuilderSidePanelContext);
  if (!ctx) {
    throw new Error("useBuilderSidePanels must be used within BuilderSidePanelProvider");
  }
  return ctx;
}

export function useBuilderSidePanelsOptional(): BuilderSidePanelContextValue | null {
  return React.useContext(BuilderSidePanelContext);
}
