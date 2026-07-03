"use client";

import * as React from "react";

import {
  EditableTemplateNameControl,
  type EditableTemplateNameControlProps,
} from "@/components/features/proposal/editor/editable-template-name-control";
import { cn } from "@/lib/utils";

export type BuilderTopBarTitleState = Pick<
  EditableTemplateNameControlProps,
  | "value"
  | "emptyLabel"
  | "editing"
  | "saving"
  | "onChange"
  | "onStartEdit"
  | "onConfirm"
  | "onCancel"
>;

interface BuilderTopBarTitleStore {
  setTitle: (state: BuilderTopBarTitleState | null) => void;
  subscribe: (listener: () => void) => () => void;
  getTitle: () => BuilderTopBarTitleState | null;
}

const BuilderTopBarTitleContext = React.createContext<BuilderTopBarTitleStore | null>(null);

export function BuilderTopBarTitleProvider({ children }: { children: React.ReactNode }) {
  const titleRef = React.useRef<BuilderTopBarTitleState | null>(null);
  const listenersRef = React.useRef(new Set<() => void>());

  const store = React.useMemo<BuilderTopBarTitleStore>(
    () => ({
      setTitle(state) {
        titleRef.current = state;
        listenersRef.current.forEach((listener) => listener());
      },
      subscribe(listener) {
        listenersRef.current.add(listener);
        return () => listenersRef.current.delete(listener);
      },
      getTitle() {
        return titleRef.current;
      },
    }),
    [],
  );

  return (
    <BuilderTopBarTitleContext.Provider value={store}>{children}</BuilderTopBarTitleContext.Provider>
  );
}

/** Top bar document title — editable when the embedded editor registers title state. */
export function BuilderTopBarTitle({ fallbackLabel }: { fallbackLabel: string }) {
  const store = React.useContext(BuilderTopBarTitleContext);
  const title = React.useSyncExternalStore(
    store?.subscribe ?? (() => () => {}),
    () => store?.getTitle() ?? null,
    () => null,
  );

  if (title) {
    return <EditableTemplateNameControl appearance="standalone" {...title} />;
  }

  return (
    <span className={cn("text-foreground min-w-0 truncate text-xs font-medium")}>{fallbackLabel}</span>
  );
}

export function useRegisterBuilderTopBarTitle(
  state: BuilderTopBarTitleState | null,
  deps: React.DependencyList,
) {
  const store = React.useContext(BuilderTopBarTitleContext);
  const stateRef = React.useRef(state);
  stateRef.current = state;

  React.useLayoutEffect(() => {
    if (!store) return;
    store.setTitle(stateRef.current);
    return () => store.setTitle(null);
  }, [store, ...deps]);
}
