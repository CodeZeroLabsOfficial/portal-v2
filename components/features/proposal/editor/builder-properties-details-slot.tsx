"use client";

import * as React from "react";

interface BuilderPropertiesDetailsStore {
  setDetails: (details: React.ReactNode) => void;
  subscribe: (listener: () => void) => () => void;
  getDetails: () => React.ReactNode;
}

const BuilderPropertiesDetailsContext = React.createContext<BuilderPropertiesDetailsStore | null>(
  null,
);

export function BuilderPropertiesDetailsProvider({ children }: { children: React.ReactNode }) {
  const detailsRef = React.useRef<React.ReactNode>(null);
  const listenersRef = React.useRef(new Set<() => void>());

  const store = React.useMemo<BuilderPropertiesDetailsStore>(
    () => ({
      setDetails(details) {
        detailsRef.current = details;
        listenersRef.current.forEach((listener) => listener());
      },
      subscribe(listener) {
        listenersRef.current.add(listener);
        return () => listenersRef.current.delete(listener);
      },
      getDetails() {
        return detailsRef.current;
      },
    }),
    [],
  );

  return (
    <BuilderPropertiesDetailsContext.Provider value={store}>
      {children}
    </BuilderPropertiesDetailsContext.Provider>
  );
}

/** Renders Properties → Details content registered by the embedded editor. */
export function BuilderPropertiesDetailsSlot() {
  const store = React.useContext(BuilderPropertiesDetailsContext);
  const details = React.useSyncExternalStore(
    store?.subscribe ?? (() => () => {}),
    () => store?.getDetails() ?? null,
    () => null,
  );
  return details;
}

/** Register Properties → Details panel for template builders. */
export function useRegisterBuilderPropertiesDetails(renderDetails: () => React.ReactNode) {
  const store = React.useContext(BuilderPropertiesDetailsContext);
  const renderRef = React.useRef(renderDetails);
  renderRef.current = renderDetails;

  React.useLayoutEffect(() => {
    if (!store) return;
    store.setDetails(renderRef.current());
  });

  React.useLayoutEffect(() => {
    return () => store?.setDetails(null);
  }, [store]);
}
