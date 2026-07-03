"use client";

import * as React from "react";

import {
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  EditableTemplateNameControl,
  type EditableTemplateNameControlProps,
} from "@/components/features/proposal/editor/editable-template-name-control";

export type BuilderBreadcrumbTitleState = Pick<
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

interface BuilderBreadcrumbTitleStore {
  setTitle: (state: BuilderBreadcrumbTitleState | null) => void;
  subscribe: (listener: () => void) => () => void;
  getTitle: () => BuilderBreadcrumbTitleState | null;
}

const BuilderBreadcrumbTitleContext = React.createContext<BuilderBreadcrumbTitleStore | null>(null);

export function BuilderBreadcrumbTitleProvider({ children }: { children: React.ReactNode }) {
  const titleRef = React.useRef<BuilderBreadcrumbTitleState | null>(null);
  const listenersRef = React.useRef(new Set<() => void>());

  const store = React.useMemo<BuilderBreadcrumbTitleStore>(
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
    <BuilderBreadcrumbTitleContext.Provider value={store}>{children}</BuilderBreadcrumbTitleContext.Provider>
  );
}

/** Last breadcrumb segment — editable when the embedded editor registers title state. */
export function BuilderBreadcrumbTitleSegment({ fallbackLabel }: { fallbackLabel: string }) {
  const store = React.useContext(BuilderBreadcrumbTitleContext);
  const title = React.useSyncExternalStore(
    store?.subscribe ?? (() => () => {}),
    () => store?.getTitle() ?? null,
    () => null,
  );

  if (title) {
    return <EditableTemplateNameControl appearance="breadcrumb" {...title} />;
  }

  return (
    <BreadcrumbPage className="max-w-[12rem] truncate sm:max-w-xs">{fallbackLabel}</BreadcrumbPage>
  );
}

export function useRegisterBuilderBreadcrumbTitle(
  state: BuilderBreadcrumbTitleState | null,
  deps: React.DependencyList,
) {
  const store = React.useContext(BuilderBreadcrumbTitleContext);
  const stateRef = React.useRef(state);
  stateRef.current = state;

  React.useLayoutEffect(() => {
    if (!store) return;
    store.setTitle(stateRef.current);
    return () => store.setTitle(null);
  }, [store, ...deps]);
}
