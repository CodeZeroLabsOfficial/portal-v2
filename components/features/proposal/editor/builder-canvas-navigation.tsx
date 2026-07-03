"use client";

import * as React from "react";

export interface BuilderCanvasNavigationState {
  selectedBlockId: string | null;
  navigateToBlock: (blockId: string) => void;
}

interface BuilderCanvasNavigationStore {
  setNavigation: (state: BuilderCanvasNavigationState | null) => void;
  subscribe: (listener: () => void) => () => void;
  getNavigation: () => BuilderCanvasNavigationState | null;
}

const BuilderCanvasNavigationContext = React.createContext<BuilderCanvasNavigationStore | null>(null);

export function proposalBuilderBlockDomId(blockId: string): string {
  return `proposal-block-${blockId}`;
}

/** Scroll the builder canvas main pane to a root block anchor. */
export function scrollBuilderCanvasToBlock(blockId: string): void {
  const el = document.getElementById(proposalBuilderBlockDomId(blockId));
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function BuilderCanvasNavigationProvider({ children }: { children: React.ReactNode }) {
  const navigationRef = React.useRef<BuilderCanvasNavigationState | null>(null);
  const listenersRef = React.useRef(new Set<() => void>());

  const store = React.useMemo<BuilderCanvasNavigationStore>(
    () => ({
      setNavigation(state) {
        navigationRef.current = state;
        listenersRef.current.forEach((listener) => listener());
      },
      subscribe(listener) {
        listenersRef.current.add(listener);
        return () => listenersRef.current.delete(listener);
      },
      getNavigation() {
        return navigationRef.current;
      },
    }),
    [],
  );

  return (
    <BuilderCanvasNavigationContext.Provider value={store}>
      {children}
    </BuilderCanvasNavigationContext.Provider>
  );
}

export function useBuilderCanvasNavigation(): BuilderCanvasNavigationState | null {
  const store = React.useContext(BuilderCanvasNavigationContext);
  return React.useSyncExternalStore(
    store?.subscribe ?? (() => () => {}),
    () => store?.getNavigation() ?? null,
    () => null,
  );
}

/** Publishes canvas selection + scroll from the embedded editor to the outline sidebar. */
export function useRegisterBuilderCanvasNavigation(
  state: BuilderCanvasNavigationState | null,
  deps: React.DependencyList,
) {
  const store = React.useContext(BuilderCanvasNavigationContext);
  const stateRef = React.useRef(state);
  stateRef.current = state;

  React.useLayoutEffect(() => {
    if (!store) return;
    store.setNavigation(stateRef.current);
    return () => store.setNavigation(null);
  }, [store, ...deps]);
}
