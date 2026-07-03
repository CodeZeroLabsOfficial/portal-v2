"use client";

import * as React from "react";

interface BuilderTopBarActionsStore {
  setActions: (actions: React.ReactNode) => void;
  subscribe: (listener: () => void) => () => void;
  getActions: () => React.ReactNode;
}

const BuilderTopBarActionsContext = React.createContext<BuilderTopBarActionsStore | null>(null);

export function BuilderTopBarActionsProvider({ children }: { children: React.ReactNode }) {
  const actionsRef = React.useRef<React.ReactNode>(null);
  const listenersRef = React.useRef(new Set<() => void>());

  const store = React.useMemo<BuilderTopBarActionsStore>(
    () => ({
      setActions(actions) {
        actionsRef.current = actions;
        listenersRef.current.forEach((listener) => listener());
      },
      subscribe(listener) {
        listenersRef.current.add(listener);
        return () => listenersRef.current.delete(listener);
      },
      getActions() {
        return actionsRef.current;
      },
    }),
    [],
  );

  return (
    <BuilderTopBarActionsContext.Provider value={store}>{children}</BuilderTopBarActionsContext.Provider>
  );
}

/** Renders document actions registered by the embedded editor (save, publish, preview). */
export function BuilderTopBarActionsSlot() {
  const store = React.useContext(BuilderTopBarActionsContext);
  const actions = React.useSyncExternalStore(
    store?.subscribe ?? (() => () => {}),
    () => store?.getActions() ?? null,
    () => null,
  );
  return actions;
}

/** Mount editor toolbar actions in the builder top bar instead of the canvas chrome row. */
export function useRegisterBuilderTopBarActions(
  renderActions: () => React.ReactNode,
  deps: React.DependencyList,
) {
  const store = React.useContext(BuilderTopBarActionsContext);
  const renderRef = React.useRef(renderActions);
  renderRef.current = renderActions;

  React.useLayoutEffect(() => {
    if (!store) return;
    store.setActions(renderRef.current());
    return () => store.setActions(null);
  }, [store, ...deps]);
}
